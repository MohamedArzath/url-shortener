import { useEffect, useState, type FormEvent } from "react"
import { ExternalLink, Link2, LoaderCircle, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  createShortUrl,
  deleteShortUrl,
  fetchUrls,
  getShortRedirectUrl,
  type ShortUrlRecord,
} from "@/lib/api"

function isValidUrl(value: string) {
  try {
    const parsedUrl = new URL(value)
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
  } catch {
    return false
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "No expiry"
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate)
}

function isActive(record: ShortUrlRecord) {
  if (record.status !== 1) {
    return false
  }

  if (!record.expire_date) {
    return true
  }

  const expiryDate = new Date(record.expire_date)
  if (Number.isNaN(expiryDate.getTime())) {
    return true
  }

  return expiryDate.getTime() > Date.now()
}

function App() {
  const [urlValue, setUrlValue] = useState("")
  const [urls, setUrls] = useState<ShortUrlRecord[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [createdLink, setCreatedLink] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadInitialUrls() {
      try {
        const nextUrls = await fetchUrls()
        if (cancelled) {
          return
        }

        setUrls(nextUrls)
        setRequestError(null)
      } catch (error) {
        if (cancelled) {
          return
        }

        setRequestError(
          error instanceof Error ? error.message : "Unable to load short URLs.",
        )
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false)
        }
      }
    }

    void loadInitialUrls()

    return () => {
      cancelled = true
    }
  }, [])

  async function refreshUrls() {
    setIsRefreshing(true)

    try {
      const nextUrls = await fetchUrls()
      setUrls(nextUrls)
      setRequestError(null)
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Unable to load short URLs.",
      )
    } finally {
      setIsRefreshing(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUrl = urlValue.trim()
    setFormError(null)
    setRequestError(null)
    setCreatedLink(null)

    if (!trimmedUrl) {
      setFormError("Enter a URL to generate a short link.")
      return
    }

    if (!isValidUrl(trimmedUrl)) {
      setFormError("Enter a valid URL starting with http:// or https://.")
      return
    }

    setIsSubmitting(true)

    try {
      const createdUrl = await createShortUrl(trimmedUrl)
      setCreatedLink(getShortRedirectUrl(createdUrl))
      setUrlValue("")
      await refreshUrls()
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Unable to create short URL.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(urlId: number) {
    setDeletingId(urlId)
    setRequestError(null)

    try {
      await deleteShortUrl(urlId)
      await refreshUrls()
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Unable to delete short URL.",
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(238,122,58,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(32,153,134,0.12),_transparent_28%),linear-gradient(180deg,_rgba(255,249,242,0.98),_rgba(248,244,236,0.94))]" />
      <div className="pointer-events-none absolute left-[-12rem] top-[12vh] h-80 w-80 rounded-full bg-[rgba(255,176,82,0.16)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-10rem] top-[30vh] h-96 w-96 rounded-full bg-[rgba(33,158,132,0.12)] blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
        <section className="flex flex-1 flex-col pt-[min(10vh,10rem)]">
          <Card className="mx-auto w-full max-w-4xl border-white/70 bg-background/86 shadow-[0_24px_80px_rgba(68,39,17,0.12)]">
            <CardContent className="px-6 py-8 sm:px-10 sm:py-10">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  Link Control Center
                </div>
                <h1 className="mt-6 text-balance font-sans text-4xl font-extrabold tracking-[-0.04em] text-foreground sm:text-2xl lg:text-4xl">
                  Turn full URLs into clean, shareable redirects.
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                  Paste a destination URL, generate a short code, and manage
                  every redirect from one screen.
                </p>
              </div>

              <form className="mx-auto mt-10 max-w-3xl" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={urlValue}
                    onChange={(event) => setUrlValue(event.target.value)}
                    placeholder="https://example.com/really/long/path"
                    className="h-14 flex-1 px-6 text-base shadow-sm"
                    aria-label="Full URL"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="min-w-44"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : null}
                    {isSubmitting ? "Creating..." : "Get Short URL"}
                  </Button>
                </div>
              </form>

              <div className="mx-auto mt-4 flex min-h-6 max-w-3xl items-center justify-center text-center">
                {formError ? (
                  <p className="text-sm font-medium text-destructive">
                    {formError}
                  </p>
                ) : null}

                {!formError && requestError ? (
                  <p className="text-sm font-medium text-destructive">
                    {requestError}
                  </p>
                ) : null}

                {!formError && !requestError && createdLink ? (
                  <p className="text-sm text-muted-foreground">
                    Created short URL:{" "}
                    <a
                      href={createdLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-foreground underline decoration-primary/60 underline-offset-4"
                    >
                      {createdLink}
                    </a>
                  </p>
                ) : null}

                {!formError && !requestError && !createdLink ? (
                  <p className="text-sm text-muted-foreground">
                    Only HTTP and HTTPS URLs are accepted.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="mx-auto mt-8 w-full border-white/70 bg-card/88 shadow-[0_24px_80px_rgba(68,39,17,0.12)]">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                    Managed URLs
                </CardTitle>
                <CardDescription className="mt-1 text-sm leading-6">
                    Review active redirects, delete old entries, and open any full or short link directly from the table.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3 mb-2">
                {isRefreshing && !isInitialLoading ? (
                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Refreshing
                  </span>
                ) : null}
                <Badge variant="secondary">{urls.length} links</Badge>
              </div>
            </CardHeader>

            <CardContent>
              <ScrollArea className="h-[430px] rounded-[28px] border border-border/70 bg-background/70">
                {isInitialLoading ? (
                  <div className="flex h-[430px] items-center justify-center gap-3 text-muted-foreground">
                    <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Loading links...</span>
                  </div>
                ) : urls.length === 0 ? (
                  <div className="flex h-[430px] flex-col items-center justify-center px-6 text-center">
                    <div className="rounded-full border border-border/70 bg-background/90 p-4 shadow-sm">
                      <Link2 className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-foreground">
                      No short URLs yet
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        Create your first short link using the form above. It will appear here immediately after the request completes.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                      <TableRow>
                        <TableHead className="min-w-72">Redirect URL</TableHead>
                        <TableHead className="min-w-56">Short URL</TableHead>
                        <TableHead className="min-w-40">Expire Date</TableHead>
                        <TableHead className="min-w-32">Status</TableHead>
                        <TableHead className="min-w-24 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {urls.map((urlRecord) => {
                        const shortLink = getShortRedirectUrl(urlRecord)
                        const active = isActive(urlRecord)

                        return (
                          <TableRow key={urlRecord.id}>
                            <TableCell className="align-top">
                              <a
                                href={urlRecord.main_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-start gap-2 text-sm font-medium text-foreground transition hover:text-primary"
                              >
                                <span className="line-clamp-2 break-all">
                                  {urlRecord.main_url}
                                </span>
                                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                              </a>
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="flex flex-col gap-2">
                                <a
                                  href={shortLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 font-mono text-sm font-medium text-primary transition hover:text-primary/80"
                                >
                                  <span className="break-all">{shortLink}</span>
                                  <ExternalLink className="h-4 w-4 shrink-0" />
                                </a> 
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(urlRecord.expire_date)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={active ? "success" : "destructive"}
                              >
                                {active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="border-destructive/30 text-destructive hover:bg-destructive/10 cursor-pointer hover:text-destructive"
                                onClick={() => void handleDelete(urlRecord.id)}
                                disabled={deletingId === urlRecord.id}
                                aria-label={`Delete ${urlRecord.short_code}`}
                              >
                                {deletingId === urlRecord.id ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}

export default App
