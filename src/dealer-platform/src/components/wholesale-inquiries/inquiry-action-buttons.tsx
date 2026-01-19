'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Eye,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  updateInquiryStatus,
  respondToQuote,
  convertToQuotation,
} from '@/actions/wholesale-inquiries'

interface InquiryActionButtonsProps {
  inquiryId: string
  status: string
}

export function InquiryActionButtons({ inquiryId, status }: InquiryActionButtonsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function handleStatusUpdate(newStatus: string) {
    setIsLoading(newStatus)
    const result = await updateInquiryStatus(inquiryId, newStatus)
    setIsLoading(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error ?? '操作失敗')
    }
  }

  async function handleRespond(response: 'accepted' | 'rejected') {
    setIsLoading(response)
    const result = await respondToQuote(inquiryId, response)
    setIsLoading(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error ?? '操作失敗')
    }
  }

  async function handleConvert() {
    setIsLoading('convert')
    const result = await convertToQuotation(inquiryId)
    setIsLoading(null)

    if (result.success && result.data) {
      router.push(`/quotations/${result.data.quotationId}`)
    } else {
      alert(result.error ?? '轉換失敗')
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {status === 'submitted' && (
        <Button
          onClick={() => handleStatusUpdate('reviewing')}
          disabled={isLoading !== null}
        >
          {isLoading === 'reviewing' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Eye className="w-4 h-4 mr-2" />
          )}
          開始審核
        </Button>
      )}

      {status === 'reviewing' && (
        <Button
          onClick={() => router.push(`/wholesale-inquiries/${inquiryId}/quote`)}
          disabled={isLoading !== null}
        >
          <Send className="w-4 h-4 mr-2" />
          填寫報價
        </Button>
      )}

      {status === 'quoted' && (
        <>
          <Button
            variant="outline"
            onClick={() => handleRespond('rejected')}
            disabled={isLoading !== null}
          >
            {isLoading === 'rejected' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            拒絕
          </Button>
          <Button
            onClick={() => handleRespond('accepted')}
            disabled={isLoading !== null}
          >
            {isLoading === 'accepted' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            接受報價
          </Button>
        </>
      )}

      {status === 'accepted' && (
        <Button
          onClick={handleConvert}
          disabled={isLoading !== null}
        >
          {isLoading === 'convert' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          轉換為報價單
        </Button>
      )}
    </div>
  )
}
