'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateContractStatus } from '@/actions/contracts'

interface ContractActionButtonsProps {
  contractId: string
  status: string
}

export function ContractActionButtons({ contractId, status }: ContractActionButtonsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  async function handleStatusUpdate(newStatus: string) {
    setIsLoading(newStatus)
    const result = await updateContractStatus(contractId, newStatus)
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
        <>
          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('draft')}
            disabled={isLoading !== null}
          >
            {isLoading === 'draft' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            退回草稿
          </Button>
          <Button
            onClick={() => handleStatusUpdate('active')}
            disabled={isLoading !== null}
          >
            {isLoading === 'active' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            核准生效
          </Button>
        </>
      )}

      {status === 'draft' && (
        <Button
          onClick={() => handleStatusUpdate('pending')}
          disabled={isLoading !== null}
        >
          {isLoading === 'pending' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          提交審核
        </Button>
      )}

      {(status === 'active' || status === 'expiring') && (
        <>
          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('terminated')}
            disabled={isLoading !== null}
          >
            {isLoading === 'terminated' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            終止合約
          </Button>
          <Button
            onClick={() => handleStatusUpdate('renewed')}
            disabled={isLoading !== null}
          >
            {isLoading === 'renewed' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            續約
          </Button>
        </>
      )}
    </div>
  )
}
