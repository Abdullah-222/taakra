import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HomeFooter } from '@/components/home/HomeFooter'
import { logActivity } from '@/lib/activity'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PropertyDetailClient } from './PropertyDetailClient'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) {
    notFound()
  }

  const property = await prisma.property.findUnique({
    where: { id },
  })

  if (!property) {
    notFound()
  }

  const currentUser = await getCurrentUser()
  await logActivity({
    action: 'property_viewed',
    entityType: 'property',
    entityId: property.id,
    userId: currentUser?.id,
    metadata: { title: property.title },
  })

  const hasImages = property.images.length > 0
  const hasVideos = property.videos.length > 0

  return (
    <div className="page-shell min-h-screen">
      <main className="py-8 sm:py-10">
        <div className="content-wrap">
          <Link href="/competitions" className="btn-secondary mb-5 inline-flex px-3 py-1.5 text-xs">
            Back to competitions
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-6">
              {hasImages && (
                <div className="surface-card overflow-hidden">
                  <PropertyImageCarousel images={property.images} />
                </div>
              )}

              {hasVideos && (
                <div className="surface-card p-5">
                  <h2 className="text-lg font-semibold tracking-tight">Property Video</h2>
                  <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-black">
                    <video src={property.videos[0]} controls className="h-full w-full object-cover" />
                  </div>
                  {property.videos.length > 1 && (
                    <p className="mt-2 text-xs text-[color:var(--muted)]">
                      Additional videos are available for this listing.
                    </p>
                  )}
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="surface-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">
                  Listing Detail
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">{property.title}</h1>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{property.location}</p>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--accent)]">{property.price}</p>
                <p className="mt-4 text-sm leading-relaxed text-[color:var(--muted)]">
                  {property.description}
                </p>
              </div>

              <PropertyDetailClient propertyId={property.id} propertyTitle={property.title} />
            </aside>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  )
}

function PropertyImageCarousel({ images }: { images: string[] }) {
  if (images.length === 0) return null

  return (
    <div>
      <div className="relative aspect-video">
        <Image src={images[0]} alt="Property image" fill className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="grid gap-2 border-t border-[var(--border)] bg-[color:var(--surface)] p-3 sm:grid-cols-4">
          {images.slice(0, 8).map((src, index) => (
            <div
              key={src + index}
              className="relative h-16 overflow-hidden rounded-lg border border-[var(--border)]"
            >
              <Image src={src} alt={`Property thumbnail ${index + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
