import CoreImage
import Foundation
import Vision

enum BackgroundRemovalError: Error, CustomStringConvertible {
  case invalidArguments
  case unreadableImage(URL)
  case noForeground(URL)
  case missingColorSpace

  var description: String {
    switch self {
    case .invalidArguments:
      return "Usage: remove-crew-backgrounds.swift INPUT_IMAGE OUTPUT_PNG"
    case .unreadableImage(let url):
      return "Could not load image at \(url.path)"
    case .noForeground(let url):
      return "Vision did not find a foreground subject in \(url.lastPathComponent)"
    case .missingColorSpace:
      return "Could not create the sRGB color space"
    }
  }
}

func removeBackground(inputURL: URL, outputURL: URL) throws {
  guard let sourceImage = CIImage(
    contentsOf: inputURL,
    options: [.applyOrientationProperty: true]
  ) else {
    throw BackgroundRemovalError.unreadableImage(inputURL)
  }

  let request = VNGenerateForegroundInstanceMaskRequest()
  let handler = VNImageRequestHandler(ciImage: sourceImage, options: [:])
  try handler.perform([request])

  guard let observation = request.results?.first,
        !observation.allInstances.isEmpty else {
    throw BackgroundRemovalError.noForeground(inputURL)
  }

  let maskBuffer = try observation.generateScaledMaskForImage(
    forInstances: observation.allInstances,
    from: handler
  )
  let maskImage = CIImage(cvPixelBuffer: maskBuffer)
    // Pull the matte a few source pixels inward to remove the old background
    // color from semi-transparent boundary pixels, then restore a natural
    // anti-aliased edge with a very small feather.
    .applyingFilter(
      "CIMorphologyMinimum",
      parameters: ["inputRadius": 4.0]
    )
    .applyingFilter(
      "CIGaussianBlur",
      parameters: [kCIInputRadiusKey: 1.25]
    )
    .cropped(to: sourceImage.extent)
  let transparentBackground = CIImage(
    color: CIColor(red: 0, green: 0, blue: 0, alpha: 0)
  ).cropped(to: sourceImage.extent)

  // Vision returns a single-channel luminance mask. CIBlendWithAlphaMask
  // would read that buffer's (opaque) alpha channel and keep the entire
  // source image. CIBlendWithMask correctly uses its white/black values.
  let cutout = sourceImage.applyingFilter(
    "CIBlendWithMask",
    parameters: [
      kCIInputBackgroundImageKey: transparentBackground,
      kCIInputMaskImageKey: maskImage,
    ]
  )

  try FileManager.default.createDirectory(
    at: outputURL.deletingLastPathComponent(),
    withIntermediateDirectories: true
  )

  guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else {
    throw BackgroundRemovalError.missingColorSpace
  }

  let context = CIContext(options: [
    .cacheIntermediates: false,
    .workingColorSpace: colorSpace,
    .outputColorSpace: colorSpace,
  ])
  try context.writePNGRepresentation(
    of: cutout,
    to: outputURL,
    format: .RGBA8,
    colorSpace: colorSpace
  )
}

do {
  guard CommandLine.arguments.count == 3 else {
    throw BackgroundRemovalError.invalidArguments
  }

  let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
  let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
  try removeBackground(inputURL: inputURL, outputURL: outputURL)
  print(outputURL.path)
} catch {
  fputs("\(error)\n", stderr)
  exit(1)
}
