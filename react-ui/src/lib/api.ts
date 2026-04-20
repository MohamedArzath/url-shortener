const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000"

export type ShortUrlRecord = {
  id: number
  main_url: string
  short_url: string
  short_code: string
  created_date: string | null
  expire_date: string | null
  status: number
}

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  return configuredBaseUrl
    ? configuredBaseUrl.replace(/\/+$/, "")
    : DEFAULT_API_BASE_URL
}

function getRequestUrl(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${getApiBaseUrl()}${normalizedPath}`
}

async function getErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as {
      detail?: string
      message?: string
    }
    return payload.detail ?? payload.message ?? "Request failed."
  }

  const text = await response.text()
  return text || "Request failed."
}

async function request<T>(pathname: string, init?: RequestInit) {
  const response = await fetch(getRequestUrl(pathname), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  return (await response.json()) as T
}

export async function fetchUrls() {
  const urls = await request<ShortUrlRecord[]>("/all-urls")

  return [...urls].sort((left, right) => {
    const leftTime = left.created_date ? new Date(left.created_date).getTime() : 0
    const rightTime = right.created_date
      ? new Date(right.created_date).getTime()
      : 0

    return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime)
  })
}

export async function createShortUrl(url: string) {
  return request<ShortUrlRecord>("/short-urls", {
    method: "POST",
    body: JSON.stringify({ url }),
  })
}

export async function deleteShortUrl(urlId: number) {
  return request<{ id: number; message: string }>(`/short-urls/${urlId}`, {
    method: "DELETE",
  })
}

export function getShortRedirectUrl(record: Pick<ShortUrlRecord, "short_url" | "short_code">) {
  const shortPath = record.short_url || `/${record.short_code}`
  return getRequestUrl(shortPath)
}
