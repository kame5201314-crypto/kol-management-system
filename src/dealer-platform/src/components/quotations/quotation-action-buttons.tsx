'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Send,
  Copy,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateQuotationStatus, duplicateQuotation, deleteQuotation } from '@/actions/quotations'

interface QuotationActionButtonsProps {
  quotationId: string
  status: string
}

export function QuotationActionButtons({ quotationId, status }: QuotationActionButtonsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function handleStatusUpdate(newStatus: string) {
    setIsLoading(newStatus)
    const result = await updateQuotationStatus(quotationId, newStatus)
    setIsLoading(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error ?? '操作失敗')
    }
  }

  async function handleDuplicate() {
    setIsLoading('duplicate')
    const result = await duplicateQuotation(quotationId)
    setIsLoading(null)

    if (result.success && result.data) {
      router.push(`/quotations/${result.data.id}`)
    } else {
      alert(result.error ?? '複製失敗')
    }
  }

  async function handleDelete() {
    if (!confirm('確定要刪除這張報價單嗎？')) return

    setIsLoading('delete')
    const result = await deleteQuotation(quotationId)
    setIsLoading(null)

    if (result.success) {
      router.push('/quotations')
    } else {
      alert(result.error ?? '刪除失敗')
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {status === 'draft' && (
        <>
          <Button
            onClick={() => handleStatusUpdate('sent')}
            disabled={isLoading !== null}
          >
            {isLoading === 'sent' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            發送報價
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading !== null}
          >
            {isLoading === 'delete' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            刪除
          </Button>
        </>
      )}
      {status === 'sent' && (
        <>
          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('rejected')}
            disabled={isLoading !== null}
          >
            {isLoading === 'rejected' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            標記拒絕
          </Button>
          <Button
            onClick={() => handleStatusUpdate('accepted')}
            disabled={isLoading !== null}
          >
            {isLoading === 'accepted' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            標記成交
          </Button>
        </>
      )}
      {status === 'viewed' && (
        <>
          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('rejected')}
            disabled={isLoading !== null}
          >
            {isLoading === 'rejected' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            標記拒絕
          </Button>
          <Button
            onClick={() => handleStatusUpdate('accepted')}
            disabled={isLoading !== null}
          >
            {isLoading === 'accepted' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            標記成交
          </Button>
        </>
      )}
      <Button
        variant="outline"
        onClick={handleDuplicate}
        disabled={isLoading !== null}
      >
        {isLoading === 'duplicate' ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Copy className="w-4 h-4 mr-2" />
        )}
        複製
      </Button>
    </div>
  )
}
