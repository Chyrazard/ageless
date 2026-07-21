import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mirroredPages } from "../generated-pages";
import { MirroredPageView } from "../mirrored-page-view";

type RouteProps = {
  params: Promise<{ slug: string[] }>;
};

function routeFromSlug(slug: string[]) {
  return `/${slug.join("/")}`;
}

export function generateStaticParams() {
  return Object.keys(mirroredPages)
    .filter((route) => route !== "/")
    .map((route) => ({ slug: route.slice(1).split("/") }));
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = mirroredPages[routeFromSlug(slug)];
  if (!page) return {};
  return { title: page.title, description: page.description };
}

export default async function MirroredRoute({ params }: RouteProps) {
  const { slug } = await params;
  const page = mirroredPages[routeFromSlug(slug)];
  if (!page) notFound();
  return <MirroredPageView page={page} />;
}
