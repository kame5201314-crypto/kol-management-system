/**
 * 環境變數驗證腳本
 * 在 build 和 dev 之前執行，確保環境變數正確
 */

// 預期的 Supabase Project ID（部署前請更新此值）
const EXPECTED_PROJECT_ID = 'your-project-id-here'

interface EnvValidation {
  name: string
  value: string | undefined
  required: boolean
  isPublic: boolean
}

async function verifyEnvironment() {
  console.log('🔍 驗證環境變數...\n')

  const envVars: EnvValidation[] = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      required: true,
      isPublic: true,
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      required: true,
      isPublic: true,
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      value: process.env.SUPABASE_SERVICE_ROLE_KEY,
      required: false, // 開發時可選
      isPublic: false,
    },
  ]

  let hasErrors = false

  // 檢查必要的環境變數
  for (const env of envVars) {
    if (env.required && !env.value) {
      console.error(`❌ ERROR: ${env.name} 未設定!`)
      hasErrors = true
    } else if (env.value) {
      // 遮蔽敏感資訊
      const maskedValue = env.isPublic
        ? env.value.substring(0, 30) + '...'
        : '********'
      console.log(`✅ ${env.name}: ${maskedValue}`)
    } else {
      console.log(`⚠️  ${env.name}: 未設定 (可選)`)
    }
  }

  // 驗證 Supabase URL 是否指向正確的專案
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl) {
    // 只有在 EXPECTED_PROJECT_ID 已更新時才驗證
    if (EXPECTED_PROJECT_ID !== 'your-project-id-here') {
      if (!supabaseUrl.includes(EXPECTED_PROJECT_ID)) {
        console.error('\n❌ ERROR: Supabase URL 與預期專案不符!')
        console.error(`   預期專案 ID: ${EXPECTED_PROJECT_ID}`)
        console.error(`   當前 URL: ${supabaseUrl}`)
        hasErrors = true
      } else {
        console.log(`\n✅ 專案 ID 驗證通過: ${EXPECTED_PROJECT_ID}`)
      }
    } else {
      console.log('\n⚠️  提醒: 請在 scripts/verify-env.ts 中更新 EXPECTED_PROJECT_ID')
    }
  }

  console.log('')

  if (hasErrors) {
    console.error('❌ 環境變數驗證失敗，請檢查 .env.local 檔案')
    process.exit(1)
  }

  console.log('✅ 環境變數驗證通過\n')
}

verifyEnvironment()
