'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateDeliveryStatus } from '@/actions/deliveries'

interface DeliveryActionButtonsProps {
  deliveryId: string
  status: string
}

export function DeliveryActionButtons({ deliveryId, status }: DeliveryActionButtonsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function handleStatusUpdate(newStatus: string) {
    setIsLoading(newStatus)
    const result = await updateDeliveryStatus(deliveryId, newStatus)
    setIsLoading(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error ?? '操作失敗')
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {status === 'pending' && (
        <Button
          onClick={() => handleStatusUpdate('in_transit')}
          disabled={isLoading !== null}
        >
          {isLoading === 'in_transit' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Truck className="w-4 h-4 mr-2" />
          )}
          標記出貨
        </Button>
      )}
      {status === 'in_transit' && (
        <Button
          onClick={() => handleStatusUpdate('delivered')}
          disabled={isLoading !== null}
        >
          {isLoading === 'delivered' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Package className="w-4 h-4 mr-2" />
          )}
          標記到貨
        </Button>
      )}
      {status === 'delivered' && (
        <Button
          onClick={() => handleStatusUpdate('inspecting')}
          disabled={isLoading !== null}
        >
          {isLoading === 'inspecting' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          開始驗收
        </Button>
      )}
      {status === 'inspecting' && (
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
            onClick={() => handleStatusUpdate('accepted')}
            disabled={isLoading !== null}
          >
            {isLoading === 'accepted' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            驗收完成
          </Button>
        </>
      )}
    </div>
  )
}
