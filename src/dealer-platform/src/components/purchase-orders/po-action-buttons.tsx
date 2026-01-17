'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  Send,
  Truck,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updatePurchaseOrderStatus, deletePurchaseOrder } from '@/actions/purchase-orders'

interface POActionButtonsProps {
  poId: string
  status: string
}

export function POActionButtons({ poId, status }: POActionButtonsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function handleStatusUpdate(newStatus: string) {
    setIsLoading(newStatus)
    const result = await updatePurchaseOrderStatus(poId, newStatus)
    setIsLoading(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error ?? '操作失敗')
    }
  }

  async function handleDelete() {
    if (!confirm('確定要刪除這張採購單嗎？')) return

    setIsLoading('delete')
    const result = await deletePurchaseOrder(poId)
    setIsLoading(null)

    if (result.success) {
      router.push('/purchase-orders')
    } else {
      alert(result.error ?? '刪除失敗')
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {status === 'draft' && (
        <>
          <Button
            onClick={() => handleStatusUpdate('pending')}
            disabled={isLoading !== null}
          >
            {isLoading === 'pending' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            送審
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading !== null}
          >
            {isLoading === 'delete' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            刪除
          </Button>
        </>
      )}
      {status === 'pending' && (
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
            退回
          </Button>
          <Button
            onClick={() => handleStatusUpdate('approved')}
            disabled={isLoading !== null}
          >
            {isLoading === 'approved' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            核准
          </Button>
        </>
      )}
      {status === 'approved' && (
        <Button
          onClick={() => handleStatusUpdate('ordered')}
          disabled={isLoading !== null}
        >
          {isLoading === 'ordered' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Truck className="w-4 h-4 mr-2" />
          )}
          確認下單
        </Button>
      )}
      {status === 'ordered' && (
        <Button
          onClick={() => handleStatusUpdate('partial')}
          disabled={isLoading !== null}
        >
          {isLoading === 'partial' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Truck className="w-4 h-4 mr-2" />
          )}
          部分到貨
        </Button>
      )}
      {(status === 'ordered' || status === 'partial') && (
        <Button
          onClick={() => handleStatusUpdate('completed')}
          disabled={isLoading !== null}
        >
          {isLoading === 'completed' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          完成
        </Button>
      )}
      {status === 'rejected' && (
        <Button
          variant="outline"
          onClick={() => handleStatusUpdate('draft')}
          disabled={isLoading !== null}
        >
          {isLoading === 'draft' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          重新編輯
        </Button>
      )}
    </div>
  )
}
