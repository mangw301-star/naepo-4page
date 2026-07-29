# 내포더봄치과 좌표 확인용 - 로컬에서 1회만 실행하는 스크립트
#
# 네이버 Geocoding API로 주소를 WGS84 위도/경도로 변환해 화면에 출력만 합니다.
# 홈페이지(visit.html)는 이 스크립트를 호출하지 않습니다. 출력된 숫자를
# visit.html 의 CLINIC_LAT / CLINIC_LNG 상수에 직접 적어 넣으세요.
#
# ── 사용법 ─────────────────────────────────────────────────────────────
# 1) 네이버클라우드플랫폼 콘솔에서 Maps > Geocoding 이용 신청
# 2) 발급받은 인증 정보를 이 PowerShell 창에서만 환경변수로 지정
#      $env:NCP_KEY_ID     = "발급받은_Client_ID"
#      $env:NCP_KEY_SECRET = "발급받은_Client_Secret"
# 3) 실행
#      powershell -ExecutionPolicy Bypass -File tools/geocode.ps1
#
# ── 주의 ───────────────────────────────────────────────────────────────
# Client Secret 은 이 파일이나 다른 어떤 파일에도 적어 두지 마세요.
# 환경변수는 창을 닫으면 사라지므로 저장소에 남지 않습니다.

$ErrorActionPreference = 'Stop'

$address = '충청남도 홍성군 홍북읍 신경리 588'

$keyId  = $env:NCP_KEY_ID
$secret = $env:NCP_KEY_SECRET

if ([string]::IsNullOrWhiteSpace($keyId) -or [string]::IsNullOrWhiteSpace($secret)) {
  Write-Host '환경변수 NCP_KEY_ID / NCP_KEY_SECRET 이 설정되지 않았습니다.' -ForegroundColor Yellow
  Write-Host '위 사용법 2번을 먼저 실행한 뒤 다시 시도하세요.'
  exit 1
}

$uri = 'https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=' +
       [System.Uri]::EscapeDataString($address)

$headers = @{
  'x-ncp-apigw-api-key-id' = $keyId
  'x-ncp-apigw-api-key'    = $secret
  'Accept'                 = 'application/json'
}

$res = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get

if ($res.addresses.Count -eq 0) {
  Write-Host "변환 결과가 없습니다: $address" -ForegroundColor Yellow
  Write-Host '주소를 지번/도로명으로 바꿔 다시 시도해 보세요.'
  exit 1
}

foreach ($a in $res.addresses) {
  Write-Host ''
  Write-Host ('도로명 : ' + $a.roadAddress)
  Write-Host ('지번   : ' + $a.jibunAddress)
  Write-Host ('위도   : ' + $a.y) -ForegroundColor Green
  Write-Host ('경도   : ' + $a.x) -ForegroundColor Green
}

Write-Host ''
Write-Host 'visit.html 에 아래 두 줄 형태로 옮겨 적으세요:' -ForegroundColor Cyan
Write-Host ('  var CLINIC_LAT = ' + $res.addresses[0].y + ';')
Write-Host ('  var CLINIC_LNG = ' + $res.addresses[0].x + ';')
