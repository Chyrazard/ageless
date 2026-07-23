import AVFoundation
import CoreVideo
import Foundation

guard CommandLine.arguments.count >= 3 else {
  fputs(
    "Usage: optimize-web-video.swift <input> <output> [width] [height] [bitrate] [duration]\n",
    stderr
  )
  exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
let asset = AVURLAsset(url: inputURL)

guard let videoTrack = asset.tracks(withMediaType: .video).first else {
  fputs("No video track found.\n", stderr)
  exit(3)
}

let targetWidth = CommandLine.arguments.count > 3
  ? Int(CommandLine.arguments[3]) ?? 960
  : 960
let targetHeight = CommandLine.arguments.count > 4
  ? Int(CommandLine.arguments[4]) ?? 540
  : 540
let targetBitrate = CommandLine.arguments.count > 5
  ? Int(CommandLine.arguments[5]) ?? 800_000
  : 800_000
let maximumDuration = CommandLine.arguments.count > 6
  ? Double(CommandLine.arguments[6])
  : nil
let sourceFrameRate = max(Int(videoTrack.nominalFrameRate.rounded()), 1)

let reader = try AVAssetReader(asset: asset)
if let maximumDuration {
  reader.timeRange = CMTimeRange(
    start: .zero,
    duration: CMTime(seconds: maximumDuration, preferredTimescale: 600)
  )
}
let readerSettings: [String: Any] = [
  kCVPixelBufferPixelFormatTypeKey as String:
    kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange,
  kCVPixelBufferWidthKey as String: targetWidth,
  kCVPixelBufferHeightKey as String: targetHeight,
]
let readerOutput = AVAssetReaderTrackOutput(
  track: videoTrack,
  outputSettings: readerSettings
)
readerOutput.alwaysCopiesSampleData = false

guard reader.canAdd(readerOutput) else {
  fputs("Unable to configure the video reader.\n", stderr)
  exit(4)
}
reader.add(readerOutput)

let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true

let compressionSettings: [String: Any] = [
  AVVideoAverageBitRateKey: targetBitrate,
  AVVideoExpectedSourceFrameRateKey: sourceFrameRate,
  AVVideoMaxKeyFrameIntervalKey: sourceFrameRate * 2,
  AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
  AVVideoAllowFrameReorderingKey: true,
]
let writerSettings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: targetWidth,
  AVVideoHeightKey: targetHeight,
  AVVideoCompressionPropertiesKey: compressionSettings,
]
let writerInput = AVAssetWriterInput(
  mediaType: .video,
  outputSettings: writerSettings
)
writerInput.expectsMediaDataInRealTime = false

guard writer.canAdd(writerInput) else {
  fputs("Unable to configure the H.264 writer.\n", stderr)
  exit(5)
}
writer.add(writerInput)

guard writer.startWriting(), reader.startReading() else {
  fputs("Unable to start video conversion.\n", stderr)
  exit(6)
}
writer.startSession(atSourceTime: .zero)

let queue = DispatchQueue(label: "ageless.web-video-encoder")
let semaphore = DispatchSemaphore(value: 0)
var conversionFailed = false

writerInput.requestMediaDataWhenReady(on: queue) {
  while writerInput.isReadyForMoreMediaData {
    guard let sampleBuffer = readerOutput.copyNextSampleBuffer() else {
      writerInput.markAsFinished()
      writer.finishWriting {
        semaphore.signal()
      }
      return
    }

    if !writerInput.append(sampleBuffer) {
      conversionFailed = true
      reader.cancelReading()
      writerInput.markAsFinished()
      writer.cancelWriting()
      semaphore.signal()
      return
    }
  }
}

semaphore.wait()

if conversionFailed || reader.status == .failed || writer.status == .failed {
  let message = writer.error?.localizedDescription
    ?? reader.error?.localizedDescription
    ?? "Unknown conversion error."
  fputs("\(message)\n", stderr)
  exit(7)
}

print(outputURL.path)
