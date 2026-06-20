const LANGUAGE_STORAGE_KEY = "ai-compute-weather-language";

const languageOptions = [
  { code: "ja", locale: "ja-JP" },
  { code: "en", locale: "en-US" },
  { code: "zh", locale: "zh-CN" },
  { code: "ko", locale: "ko-KR" },
  { code: "es", locale: "es-ES" },
  { code: "ceb", locale: "ceb-PH" },
  { code: "th", locale: "th-TH" },
  { code: "vi", locale: "vi-VN" },
  { code: "pt", locale: "pt-PT" }
];

const translations = {
  ja: {
    "document.title": "AI Compute Weather",
    "hero.title": "安い時間帯へ逃がす実行レイヤー",
    "language.label": "言語",
    "refresh": "更新",
    "exportCsv": "CSVを書き出し",
    "marketSummary": "市場サマリー",
    "metric.cheapest": "最安",
    "metric.signal": "シグナル",
    "metric.liveOffers": "ライブ価格",
    "metric.queuedJobs": "待機ジョブ",
    "market.eyebrow": "市場",
    "market.title": "GPU価格",
    "filter.gpu": "GPUフィルタ",
    "filter.provider": "プロバイダフィルタ",
    "table.provider": "プロバイダ",
    "table.gpu": "GPU",
    "table.region": "リージョン",
    "table.instance": "インスタンス",
    "table.price": "$/GPU時",
    "table.source": "ソース",
    "dispatch.eyebrow": "実行判断",
    "queue.eyebrow": "キュー",
    "form.name": "名前",
    "form.gpu": "GPU",
    "form.executor": "実行先",
    "form.command": "コマンド",
    "form.maxPrice": "上限 $/GPU時",
    "form.retries": "リトライ",
    "form.timeout": "タイムアウト秒",
    "form.deadline": "期限 時間",
    "form.queueJob": "ジョブを追加",
    "trend.eyebrow": "推移",
    "trend.title": "最安価格",
    "trend.samples": "直近96サンプル",
    "jobs.eyebrow": "ジョブ",
    "jobs.title": "バッチキュー",
    "all": "すべて",
    "any": "指定なし",
    "noQueuedJobs": "待機中のジョブはありません",
    "totalOffers": "全{count}件",
    "runningCount": "{count}件実行中",
    "offersCount": "{count}件の価格",
    "latencyMs": "{ms} ms",
    "chart.waiting": "価格サンプルを待っています",
    "sourceType.live": "ライブ",
    "sourceType.proxy": "代理",
    "status.queued": "待機中",
    "status.dispatching": "送信中",
    "status.running": "実行中",
    "status.retrying": "再試行中",
    "status.complete": "完了",
    "status.failed": "失敗",
    "status.expired": "期限切れ",
    "status.canceled": "キャンセル済み",
    "status.ready": "準備完了",
    "status.local-only": "ローカルのみ",
    "status.planned": "予定",
    "status.configured": "設定済み",
    "status.live": "ライブ",
    "status.degraded": "低下",
    "executor.dry-run": "ドライラン",
    "executor.local": "ローカルコマンド",
    "executor.vast": "Vast.ai",
    "executor.runpod": "RunPod",
    "executor.vastPlanned": "Vast.ai コネクタ（予定）",
    "executor.runpodPlanned": "RunPod コネクタ（予定）",
    "job.belowBy": "{deadline}までに{price}/GPU時以下の{gpu}",
    "job.attempt": "{executor} · 試行 {current}/{total}",
    "job.cancel": "キャンセル",
    "job.summary.queued": "{gpu}が{price}/GPU時以下になるのを待機中。",
    "job.summary.dispatching": "条件を満たした実行先へ送信しています。",
    "job.summary.running": "選択した実行先で実行中です。",
    "job.summary.retrying": "次の安い実行枠で再試行します。",
    "job.summary.complete": "ジョブは完了しました。",
    "job.summary.failed": "ジョブは失敗しました。",
    "job.summary.expired": "期限までに条件を満たせませんでした。",
    "job.summary.canceled": "ジョブはキャンセルされました。",
    "recommendation.wait.label": "市場データなし",
    "recommendation.wait.action": "待機",
    "recommendation.wait.detail": "まだ価格コレクタからオファーが返っていません。",
    "recommendation.run.label": "今すぐ実行",
    "recommendation.run.action": "実行",
    "recommendation.run.detail": "{provider} {gpu} は直近平均より{percent}%安くなっています。",
    "recommendation.run.detailFallback": "{provider} {gpu} は現在、直近平均より安い水準です。",
    "recommendation.defer.label": "延期",
    "recommendation.defer.action": "待つ",
    "recommendation.defer.detail": "現在の最安価格は直近平均より{percent}%高くなっています。",
    "recommendation.defer.detailFallback": "現在の最安価格は直近平均より高い水準です。",
    "recommendation.watch.label": "監視",
    "recommendation.watch.action": "様子見",
    "recommendation.watch.detail": "価格は直近平均に近い水準です。"
  },
  en: {
    "document.title": "AI Compute Weather",
    "hero.title": "Off-peak compute router",
    "language.label": "Language",
    "refresh": "Refresh",
    "exportCsv": "Export CSV",
    "marketSummary": "Market summary",
    "metric.cheapest": "Cheapest",
    "metric.signal": "Signal",
    "metric.liveOffers": "Live offers",
    "metric.queuedJobs": "Queued jobs",
    "market.eyebrow": "Market",
    "market.title": "GPU prices",
    "filter.gpu": "GPU filter",
    "filter.provider": "Provider filter",
    "table.provider": "Provider",
    "table.gpu": "GPU",
    "table.region": "Region",
    "table.instance": "Instance",
    "table.price": "$/GPU h",
    "table.source": "Source",
    "dispatch.eyebrow": "Dispatch",
    "queue.eyebrow": "Queue",
    "form.name": "Name",
    "form.gpu": "GPU",
    "form.executor": "Executor",
    "form.command": "Command",
    "form.maxPrice": "Max $/GPU h",
    "form.retries": "Retries",
    "form.timeout": "Timeout s",
    "form.deadline": "Deadline h",
    "form.queueJob": "Queue job",
    "trend.eyebrow": "Trend",
    "trend.title": "Cheapest price",
    "trend.samples": "Last 96 samples",
    "jobs.eyebrow": "Jobs",
    "jobs.title": "Batch queue",
    "all": "All",
    "any": "Any",
    "noQueuedJobs": "No queued jobs",
    "totalOffers": "{count} total offers",
    "runningCount": "{count} running",
    "offersCount": "{count} offers",
    "latencyMs": "{ms} ms",
    "chart.waiting": "Waiting for price samples",
    "sourceType.live": "live",
    "sourceType.proxy": "proxy",
    "status.queued": "queued",
    "status.dispatching": "dispatching",
    "status.running": "running",
    "status.retrying": "retrying",
    "status.complete": "complete",
    "status.failed": "failed",
    "status.expired": "expired",
    "status.canceled": "canceled",
    "status.ready": "ready",
    "status.local-only": "local-only",
    "status.planned": "planned",
    "status.configured": "configured",
    "status.live": "live",
    "status.degraded": "degraded",
    "executor.dry-run": "Dry run",
    "executor.local": "Local command",
    "executor.vast": "Vast.ai",
    "executor.runpod": "RunPod",
    "executor.vastPlanned": "Vast.ai connector (planned)",
    "executor.runpodPlanned": "RunPod connector (planned)",
    "job.belowBy": "{gpu} below {price} by {deadline}",
    "job.attempt": "{executor} · attempt {current}/{total}",
    "job.cancel": "Cancel",
    "job.summary.queued": "Waiting for {gpu} at or below {price}/GPU hour.",
    "job.summary.dispatching": "Dispatching to the matched execution target.",
    "job.summary.running": "Running on the selected execution target.",
    "job.summary.retrying": "Retrying on the next cheap execution window.",
    "job.summary.complete": "Job completed.",
    "job.summary.failed": "Job failed.",
    "job.summary.expired": "No matching price arrived before the deadline.",
    "job.summary.canceled": "Job canceled.",
    "recommendation.wait.label": "No market data",
    "recommendation.wait.action": "Wait",
    "recommendation.wait.detail": "Collectors have not returned offers yet.",
    "recommendation.run.label": "Run now",
    "recommendation.run.action": "Run",
    "recommendation.run.detail": "{provider} {gpu} is {percent}% below the recent average.",
    "recommendation.run.detailFallback": "{provider} {gpu} is currently below the recent average.",
    "recommendation.defer.label": "Defer",
    "recommendation.defer.action": "Wait",
    "recommendation.defer.detail": "Current cheapest price is {percent}% above the recent average.",
    "recommendation.defer.detailFallback": "Current cheapest price is above the recent average.",
    "recommendation.watch.label": "Watch",
    "recommendation.watch.action": "Watch",
    "recommendation.watch.detail": "Prices are close to the recent average."
  },
  zh: {
    "document.title": "AI Compute Weather",
    "hero.title": "低峰算力路由器",
    "language.label": "语言",
    "refresh": "刷新",
    "exportCsv": "导出 CSV",
    "marketSummary": "市场摘要",
    "metric.cheapest": "最低价",
    "metric.signal": "信号",
    "metric.liveOffers": "实时报价",
    "metric.queuedJobs": "排队任务",
    "market.eyebrow": "市场",
    "market.title": "GPU 价格",
    "filter.gpu": "GPU 筛选",
    "filter.provider": "供应商筛选",
    "table.provider": "供应商",
    "table.gpu": "GPU",
    "table.region": "区域",
    "table.instance": "实例",
    "table.price": "$/GPU 小时",
    "table.source": "来源",
    "dispatch.eyebrow": "调度",
    "queue.eyebrow": "队列",
    "form.name": "名称",
    "form.gpu": "GPU",
    "form.executor": "执行器",
    "form.command": "命令",
    "form.maxPrice": "最高 $/GPU 小时",
    "form.retries": "重试",
    "form.timeout": "超时 秒",
    "form.deadline": "截止 小时",
    "form.queueJob": "加入队列",
    "trend.eyebrow": "趋势",
    "trend.title": "最低价格",
    "trend.samples": "最近 96 个样本",
    "jobs.eyebrow": "任务",
    "jobs.title": "批处理队列",
    "all": "全部",
    "any": "任意",
    "noQueuedJobs": "没有排队任务",
    "totalOffers": "共 {count} 个报价",
    "runningCount": "{count} 个运行中",
    "offersCount": "{count} 个报价",
    "latencyMs": "{ms} ms",
    "chart.waiting": "正在等待价格样本",
    "sourceType.live": "实时",
    "sourceType.proxy": "代理",
    "status.queued": "排队中",
    "status.dispatching": "调度中",
    "status.running": "运行中",
    "status.retrying": "重试中",
    "status.complete": "完成",
    "status.failed": "失败",
    "status.expired": "已过期",
    "status.canceled": "已取消",
    "status.ready": "就绪",
    "status.local-only": "仅本地",
    "status.planned": "计划中",
    "status.configured": "已配置",
    "status.live": "实时",
    "status.degraded": "降级",
    "executor.dry-run": "试运行",
    "executor.local": "本地命令",
    "executor.vast": "Vast.ai",
    "executor.runpod": "RunPod",
    "executor.vastPlanned": "Vast.ai 连接器（计划中）",
    "executor.runpodPlanned": "RunPod 连接器（计划中）",
    "job.belowBy": "{deadline} 前 {gpu} 低于 {price}",
    "job.attempt": "{executor} · 尝试 {current}/{total}",
    "job.cancel": "取消",
    "job.summary.queued": "等待 {gpu} 降到 {price}/GPU 小时或更低。",
    "job.summary.dispatching": "正在调度到匹配的执行目标。",
    "job.summary.running": "正在所选执行目标上运行。",
    "job.summary.retrying": "将在下一个低价执行窗口重试。",
    "job.summary.complete": "任务已完成。",
    "job.summary.failed": "任务失败。",
    "job.summary.expired": "截止前没有等到匹配价格。",
    "job.summary.canceled": "任务已取消。",
    "recommendation.wait.label": "没有市场数据",
    "recommendation.wait.action": "等待",
    "recommendation.wait.detail": "采集器尚未返回报价。",
    "recommendation.run.label": "立即运行",
    "recommendation.run.action": "运行",
    "recommendation.run.detail": "{provider} {gpu} 比近期平均低 {percent}%。",
    "recommendation.run.detailFallback": "{provider} {gpu} 当前低于近期平均。",
    "recommendation.defer.label": "延后",
    "recommendation.defer.action": "等待",
    "recommendation.defer.detail": "当前最低价比近期平均高 {percent}%。",
    "recommendation.defer.detailFallback": "当前最低价高于近期平均。",
    "recommendation.watch.label": "观察",
    "recommendation.watch.action": "观察",
    "recommendation.watch.detail": "价格接近近期平均。"
  },
  ko: {
    "document.title": "AI Compute Weather",
    "hero.title": "비피크 컴퓨트 라우터",
    "language.label": "언어",
    "refresh": "새로고침",
    "exportCsv": "CSV 내보내기",
    "marketSummary": "시장 요약",
    "metric.cheapest": "최저가",
    "metric.signal": "신호",
    "metric.liveOffers": "실시간 오퍼",
    "metric.queuedJobs": "대기 작업",
    "market.eyebrow": "시장",
    "market.title": "GPU 가격",
    "filter.gpu": "GPU 필터",
    "filter.provider": "공급자 필터",
    "table.provider": "공급자",
    "table.gpu": "GPU",
    "table.region": "리전",
    "table.instance": "인스턴스",
    "table.price": "$/GPU 시간",
    "table.source": "소스",
    "dispatch.eyebrow": "디스패치",
    "queue.eyebrow": "큐",
    "form.name": "이름",
    "form.gpu": "GPU",
    "form.executor": "실행기",
    "form.command": "명령",
    "form.maxPrice": "최대 $/GPU 시간",
    "form.retries": "재시도",
    "form.timeout": "타임아웃 초",
    "form.deadline": "마감 시간",
    "form.queueJob": "작업 추가",
    "trend.eyebrow": "추세",
    "trend.title": "최저 가격",
    "trend.samples": "최근 96개 샘플",
    "jobs.eyebrow": "작업",
    "jobs.title": "배치 큐",
    "all": "전체",
    "any": "무관",
    "noQueuedJobs": "대기 중인 작업 없음",
    "totalOffers": "총 {count}개 오퍼",
    "runningCount": "{count}개 실행 중",
    "offersCount": "{count}개 오퍼",
    "latencyMs": "{ms} ms",
    "chart.waiting": "가격 샘플을 기다리는 중",
    "sourceType.live": "실시간",
    "sourceType.proxy": "프록시",
    "status.queued": "대기 중",
    "status.dispatching": "디스패치 중",
    "status.running": "실행 중",
    "status.retrying": "재시도 중",
    "status.complete": "완료",
    "status.failed": "실패",
    "status.expired": "만료",
    "status.canceled": "취소됨",
    "status.ready": "준비됨",
    "status.local-only": "로컬 전용",
    "status.planned": "예정",
    "status.configured": "설정됨",
    "status.live": "실시간",
    "status.degraded": "저하",
    "executor.dry-run": "드라이런",
    "executor.local": "로컬 명령",
    "executor.vast": "Vast.ai",
    "executor.runpod": "RunPod",
    "executor.vastPlanned": "Vast.ai 커넥터(예정)",
    "executor.runpodPlanned": "RunPod 커넥터(예정)",
    "job.belowBy": "{deadline}까지 {gpu} {price} 이하",
    "job.attempt": "{executor} · 시도 {current}/{total}",
    "job.cancel": "취소",
    "job.summary.queued": "{gpu}가 {price}/GPU 시간 이하가 될 때까지 대기 중입니다.",
    "job.summary.dispatching": "조건에 맞는 실행 대상으로 보내는 중입니다.",
    "job.summary.running": "선택된 실행 대상에서 실행 중입니다.",
    "job.summary.retrying": "다음 저가 실행 구간에서 재시도합니다.",
    "job.summary.complete": "작업이 완료되었습니다.",
    "job.summary.failed": "작업이 실패했습니다.",
    "job.summary.expired": "마감 전 조건에 맞는 가격이 없었습니다.",
    "job.summary.canceled": "작업이 취소되었습니다.",
    "recommendation.wait.label": "시장 데이터 없음",
    "recommendation.wait.action": "대기",
    "recommendation.wait.detail": "아직 수집기가 오퍼를 반환하지 않았습니다.",
    "recommendation.run.label": "지금 실행",
    "recommendation.run.action": "실행",
    "recommendation.run.detail": "{provider} {gpu}가 최근 평균보다 {percent}% 낮습니다.",
    "recommendation.run.detailFallback": "{provider} {gpu}는 현재 최근 평균보다 낮습니다.",
    "recommendation.defer.label": "연기",
    "recommendation.defer.action": "대기",
    "recommendation.defer.detail": "현재 최저 가격이 최근 평균보다 {percent}% 높습니다.",
    "recommendation.defer.detailFallback": "현재 최저 가격이 최근 평균보다 높습니다.",
    "recommendation.watch.label": "감시",
    "recommendation.watch.action": "관망",
    "recommendation.watch.detail": "가격이 최근 평균에 가깝습니다."
  },
  es: {
    "document.title": "AI Compute Weather",
    "hero.title": "Router de cómputo fuera de pico",
    "language.label": "Idioma",
    "refresh": "Actualizar",
    "exportCsv": "Exportar CSV",
    "marketSummary": "Resumen del mercado",
    "metric.cheapest": "Más barato",
    "metric.signal": "Señal",
    "metric.liveOffers": "Ofertas en vivo",
    "metric.queuedJobs": "Trabajos en cola",
    "market.eyebrow": "Mercado",
    "market.title": "Precios de GPU",
    "filter.gpu": "Filtro de GPU",
    "filter.provider": "Filtro de proveedor",
    "table.provider": "Proveedor",
    "table.gpu": "GPU",
    "table.region": "Región",
    "table.instance": "Instancia",
    "table.price": "$/GPU h",
    "table.source": "Fuente",
    "dispatch.eyebrow": "Despacho",
    "queue.eyebrow": "Cola",
    "form.name": "Nombre",
    "form.gpu": "GPU",
    "form.executor": "Ejecutor",
    "form.command": "Comando",
    "form.maxPrice": "Máx. $/GPU h",
    "form.retries": "Reintentos",
    "form.timeout": "Timeout s",
    "form.deadline": "Plazo h",
    "form.queueJob": "Encolar trabajo",
    "trend.eyebrow": "Tendencia",
    "trend.title": "Precio más bajo",
    "trend.samples": "Últimas 96 muestras",
    "jobs.eyebrow": "Trabajos",
    "jobs.title": "Cola batch",
    "all": "Todo",
    "any": "Cualquiera",
    "noQueuedJobs": "No hay trabajos en cola",
    "totalOffers": "{count} ofertas en total",
    "runningCount": "{count} en ejecución",
    "offersCount": "{count} ofertas",
    "latencyMs": "{ms} ms",
    "chart.waiting": "Esperando muestras de precios",
    "sourceType.live": "en vivo",
    "sourceType.proxy": "proxy",
    "status.queued": "en cola",
    "status.dispatching": "despachando",
    "status.running": "ejecutando",
    "status.retrying": "reintentando",
    "status.complete": "completo",
    "status.failed": "falló",
    "status.expired": "vencido",
    "status.canceled": "cancelado",
    "status.ready": "listo",
    "status.local-only": "solo local",
    "status.planned": "planificado",
    "status.configured": "configurado",
    "status.live": "en vivo",
    "status.degraded": "degradado",
    "executor.dry-run": "Simulación",
    "executor.local": "Comando local",
    "executor.vast": "Vast.ai",
    "executor.runpod": "RunPod",
    "executor.vastPlanned": "Conector Vast.ai (planificado)",
    "executor.runpodPlanned": "Conector RunPod (planificado)",
    "job.belowBy": "{gpu} por debajo de {price} antes de {deadline}",
    "job.attempt": "{executor} · intento {current}/{total}",
    "job.cancel": "Cancelar",
    "job.summary.queued": "Esperando que {gpu} esté en {price}/GPU hora o menos.",
    "job.summary.dispatching": "Despachando al destino de ejecución elegido.",
    "job.summary.running": "Ejecutando en el destino seleccionado.",
    "job.summary.retrying": "Reintentando en la próxima ventana barata.",
    "job.summary.complete": "Trabajo completado.",
    "job.summary.failed": "El trabajo falló.",
    "job.summary.expired": "No llegó un precio compatible antes del plazo.",
    "job.summary.canceled": "Trabajo cancelado.",
    "recommendation.wait.label": "Sin datos de mercado",
    "recommendation.wait.action": "Esperar",
    "recommendation.wait.detail": "Los recolectores aún no devolvieron ofertas.",
    "recommendation.run.label": "Ejecutar ahora",
    "recommendation.run.action": "Ejecutar",
    "recommendation.run.detail": "{provider} {gpu} está {percent}% por debajo del promedio reciente.",
    "recommendation.run.detailFallback": "{provider} {gpu} está por debajo del promedio reciente.",
    "recommendation.defer.label": "Diferir",
    "recommendation.defer.action": "Esperar",
    "recommendation.defer.detail": "El precio mínimo actual está {percent}% por encima del promedio reciente.",
    "recommendation.defer.detailFallback": "El precio mínimo actual está por encima del promedio reciente.",
    "recommendation.watch.label": "Vigilar",
    "recommendation.watch.action": "Vigilar",
    "recommendation.watch.detail": "Los precios están cerca del promedio reciente."
  },
  ceb: {
    "document.title": "AI Compute Weather",
    "hero.title": "Router sa compute kung dili peak",
    "language.label": "Pinulongan",
    "refresh": "I-refresh",
    "exportCsv": "I-export ang CSV",
    "marketSummary": "Sumaryo sa merkado",
    "metric.cheapest": "Pinakabarato",
    "metric.signal": "Senyales",
    "metric.liveOffers": "Live nga offer",
    "metric.queuedJobs": "Trabaho sa pila",
    "market.eyebrow": "Merkado",
    "market.title": "Presyo sa GPU",
    "filter.gpu": "Filter sa GPU",
    "filter.provider": "Filter sa provider",
    "table.provider": "Provider",
    "table.gpu": "GPU",
    "table.region": "Rehiyon",
    "table.instance": "Instance",
    "table.price": "$/GPU oras",
    "table.source": "Tinubdan",
    "dispatch.eyebrow": "Dispatch",
    "queue.eyebrow": "Pila",
    "form.name": "Ngalan",
    "form.gpu": "GPU",
    "form.executor": "Executor",
    "form.command": "Command",
    "form.maxPrice": "Max $/GPU oras",
    "form.retries": "Retry",
    "form.timeout": "Timeout s",
    "form.deadline": "Deadline h",
    "form.queueJob": "I-queue ang trabaho",
    "trend.eyebrow": "Trend",
    "trend.title": "Pinakabarato nga presyo",
    "trend.samples": "Katapusang 96 samples",
    "jobs.eyebrow": "Trabaho",
    "jobs.title": "Batch queue",
    "all": "Tanan",
    "any": "Bisan unsa",
    "noQueuedJobs": "Walay trabaho sa pila",
    "totalOffers": "{count} tanan nga offer",
    "runningCount": "{count} nagdagan",
    "offersCount": "{count} offer",
    "latencyMs": "{ms} ms",
    "chart.waiting": "Naghulat sa price samples",
    "sourceType.live": "live",
    "sourceType.proxy": "proxy",
    "status.queued": "naa sa pila",
    "status.dispatching": "gipadala",
    "status.running": "nagdagan",
    "status.retrying": "nag-retry",
    "status.complete": "human",
    "status.failed": "napakyas",
    "status.expired": "expired",
    "status.canceled": "gikansela",
    "status.ready": "andam",
    "status.local-only": "lokal ra",
    "status.planned": "plano",
    "status.configured": "na-configure",
    "status.live": "live",
    "status.degraded": "degraded",
    "executor.dry-run": "Dry run",
    "executor.local": "Lokal nga command",
    "executor.vast": "Vast.ai",
    "executor.runpod": "RunPod",
    "executor.vastPlanned": "Vast.ai connector (plano)",
    "executor.runpodPlanned": "RunPod connector (plano)",
    "job.belowBy": "{gpu} ubos sa {price} hangtod {deadline}",
    "job.attempt": "{executor} · sulay {current}/{total}",
    "job.cancel": "Kansela",
    "job.summary.queued": "Naghulat nga ang {gpu} mahimong {price}/GPU oras o ubos pa.",
    "job.summary.dispatching": "Gipadala sa napili nga execution target.",
    "job.summary.running": "Nagdagan sa napili nga execution target.",
    "job.summary.retrying": "Mosulay pag-usab sa sunod nga barato nga window.",
    "job.summary.complete": "Human na ang trabaho.",
    "job.summary.failed": "Napakyas ang trabaho.",
    "job.summary.expired": "Walay nisakar nga presyo sa wala pa ang deadline.",
    "job.summary.canceled": "Gikansela ang trabaho.",
    "recommendation.wait.label": "Walay data sa merkado",
    "recommendation.wait.action": "Hulat",
    "recommendation.wait.detail": "Wala pa makabalik ug offers ang collectors.",
    "recommendation.run.label": "Padagana karon",
    "recommendation.run.action": "Padagana",
    "recommendation.run.detail": "{provider} {gpu} kay {percent}% ubos sa bag-ong average.",
    "recommendation.run.detailFallback": "{provider} {gpu} kay ubos sa bag-ong average karon.",
    "recommendation.defer.label": "Ihulat",
    "recommendation.defer.action": "Hulat",
    "recommendation.defer.detail": "Ang pinakabarato karon kay {percent}% mas taas sa bag-ong average.",
    "recommendation.defer.detailFallback": "Ang pinakabarato karon kay mas taas sa bag-ong average.",
    "recommendation.watch.label": "Bantayi",
    "recommendation.watch.action": "Bantay",
    "recommendation.watch.detail": "Duol ang presyo sa bag-ong average."
  },
  th: {
    "document.title": "AI Compute Weather",
    "hero.title": "เราเตอร์คอมพิวต์ช่วงนอกพีก",
    "language.label": "ภาษา",
    "refresh": "รีเฟรช",
    "exportCsv": "ส่งออก CSV",
    "marketSummary": "สรุปตลาด",
    "metric.cheapest": "ถูกที่สุด",
    "metric.signal": "สัญญาณ",
    "metric.liveOffers": "ข้อเสนอสด",
    "metric.queuedJobs": "งานในคิว",
    "market.eyebrow": "ตลาด",
    "market.title": "ราคา GPU",
    "filter.gpu": "ตัวกรอง GPU",
    "filter.provider": "ตัวกรองผู้ให้บริการ",
    "table.provider": "ผู้ให้บริการ",
    "table.gpu": "GPU",
    "table.region": "ภูมิภาค",
    "table.instance": "อินสแตนซ์",
    "table.price": "$/GPU ชม.",
    "table.source": "แหล่งข้อมูล",
    "dispatch.eyebrow": "ส่งงาน",
    "queue.eyebrow": "คิว",
    "form.name": "ชื่อ",
    "form.gpu": "GPU",
    "form.executor": "ตัวรัน",
    "form.command": "คำสั่ง",
    "form.maxPrice": "สูงสุด $/GPU ชม.",
    "form.retries": "ลองซ้ำ",
    "form.timeout": "หมดเวลา วินาที",
    "form.deadline": "เส้นตาย ชม.",
    "form.queueJob": "เพิ่มงานเข้าคิว",
    "trend.eyebrow": "แนวโน้ม",
    "trend.title": "ราคาต่ำสุด",
    "trend.samples": "96 ตัวอย่างล่าสุด",
    "jobs.eyebrow": "งาน",
    "jobs.title": "คิวแบตช์",
    "all": "ทั้งหมด",
    "any": "ใดก็ได้",
    "noQueuedJobs": "ไม่มีงานในคิว",
    "totalOffers": "ทั้งหมด {count} ข้อเสนอ",
    "runningCount": "กำลังรัน {count} งาน",
    "offersCount": "{count} ข้อเสนอ",
    "latencyMs": "{ms} ms",
    "chart.waiting": "กำลังรอตัวอย่างราคา",
    "sourceType.live": "สด",
    "sourceType.proxy": "พร็อกซี",
    "status.queued": "รอคิว",
    "status.dispatching": "กำลังส่ง",
    "status.running": "กำลังรัน",
    "status.retrying": "กำลังลองซ้ำ",
    "status.complete": "เสร็จสิ้น",
    "status.failed": "ล้มเหลว",
    "status.expired": "หมดอายุ",
    "status.canceled": "ยกเลิกแล้ว",
    "status.ready": "พร้อม",
    "status.local-only": "เฉพาะเครื่องนี้",
    "status.planned": "วางแผนไว้",
    "status.configured": "ตั้งค่าแล้ว",
    "status.live": "สด",
    "status.degraded": "ลดระดับ",
    "executor.dry-run": "จำลอง",
    "executor.local": "คำสั่งในเครื่อง",
    "executor.vast": "Vast.ai",
    "executor.runpod": "RunPod",
    "executor.vastPlanned": "ตัวเชื่อม Vast.ai (วางแผนไว้)",
    "executor.runpodPlanned": "ตัวเชื่อม RunPod (วางแผนไว้)",
    "job.belowBy": "{gpu} ต่ำกว่า {price} ภายใน {deadline}",
    "job.attempt": "{executor} · ครั้งที่ {current}/{total}",
    "job.cancel": "ยกเลิก",
    "job.summary.queued": "รอให้ {gpu} อยู่ที่ {price}/GPU ชม. หรือต่ำกว่า",
    "job.summary.dispatching": "กำลังส่งไปยังเป้าหมายที่ตรงเงื่อนไข",
    "job.summary.running": "กำลังรันบนเป้าหมายที่เลือก",
    "job.summary.retrying": "จะลองซ้ำในช่วงราคาถูกถัดไป",
    "job.summary.complete": "งานเสร็จสิ้นแล้ว",
    "job.summary.failed": "งานล้มเหลว",
    "job.summary.expired": "ไม่มีราคาที่ตรงเงื่อนไขก่อนเส้นตาย",
    "job.summary.canceled": "งานถูกยกเลิกแล้ว",
    "recommendation.wait.label": "ไม่มีข้อมูลตลาด",
    "recommendation.wait.action": "รอ",
    "recommendation.wait.detail": "ตัวเก็บข้อมูลยังไม่ส่งข้อเสนอกลับมา",
    "recommendation.run.label": "รันตอนนี้",
    "recommendation.run.action": "รัน",
    "recommendation.run.detail": "{provider} {gpu} ต่ำกว่าค่าเฉลี่ยล่าสุด {percent}%",
    "recommendation.run.detailFallback": "{provider} {gpu} ต่ำกว่าค่าเฉลี่ยล่าสุดในขณะนี้",
    "recommendation.defer.label": "เลื่อน",
    "recommendation.defer.action": "รอ",
    "recommendation.defer.detail": "ราคาต่ำสุดปัจจุบันสูงกว่าค่าเฉลี่ยล่าสุด {percent}%",
    "recommendation.defer.detailFallback": "ราคาต่ำสุดปัจจุบันสูงกว่าค่าเฉลี่ยล่าสุด",
    "recommendation.watch.label": "เฝ้าดู",
    "recommendation.watch.action": "เฝ้าดู",
    "recommendation.watch.detail": "ราคาใกล้เคียงกับค่าเฉลี่ยล่าสุด"
  },
  vi: {
    "document.title": "AI Compute Weather",
    "hero.title": "Bộ định tuyến tính toán giờ thấp điểm",
    "language.label": "Ngôn ngữ",
    "refresh": "Làm mới",
    "exportCsv": "Xuất CSV",
    "marketSummary": "Tóm tắt thị trường",
    "metric.cheapest": "Rẻ nhất",
    "metric.signal": "Tín hiệu",
    "metric.liveOffers": "Giá trực tiếp",
    "metric.queuedJobs": "Tác vụ chờ",
    "market.eyebrow": "Thị trường",
    "market.title": "Giá GPU",
    "filter.gpu": "Bộ lọc GPU",
    "filter.provider": "Bộ lọc nhà cung cấp",
    "table.provider": "Nhà cung cấp",
    "table.gpu": "GPU",
    "table.region": "Khu vực",
    "table.instance": "Instance",
    "table.price": "$/GPU giờ",
    "table.source": "Nguồn",
    "dispatch.eyebrow": "Điều phối",
    "queue.eyebrow": "Hàng đợi",
    "form.name": "Tên",
    "form.gpu": "GPU",
    "form.executor": "Bộ thực thi",
    "form.command": "Lệnh",
    "form.maxPrice": "Tối đa $/GPU giờ",
    "form.retries": "Thử lại",
    "form.timeout": "Hết hạn giây",
    "form.deadline": "Hạn giờ",
    "form.queueJob": "Thêm tác vụ",
    "trend.eyebrow": "Xu hướng",
    "trend.title": "Giá rẻ nhất",
    "trend.samples": "96 mẫu gần nhất",
    "jobs.eyebrow": "Tác vụ",
    "jobs.title": "Hàng đợi batch",
    "all": "Tất cả",
    "any": "Bất kỳ",
    "noQueuedJobs": "Không có tác vụ chờ",
    "totalOffers": "Tổng {count} giá",
    "runningCount": "{count} đang chạy",
    "offersCount": "{count} giá",
    "latencyMs": "{ms} ms",
    "chart.waiting": "Đang chờ mẫu giá",
    "sourceType.live": "trực tiếp",
    "sourceType.proxy": "proxy",
    "status.queued": "đang chờ",
    "status.dispatching": "đang điều phối",
    "status.running": "đang chạy",
    "status.retrying": "đang thử lại",
    "status.complete": "hoàn tất",
    "status.failed": "thất bại",
    "status.expired": "hết hạn",
    "status.canceled": "đã hủy",
    "status.ready": "sẵn sàng",
    "status.local-only": "chỉ cục bộ",
    "status.planned": "đã lên kế hoạch",
    "status.configured": "đã cấu hình",
    "status.live": "trực tiếp",
    "status.degraded": "suy giảm",
    "executor.dry-run": "Chạy thử",
    "executor.local": "Lệnh cục bộ",
    "executor.vast": "Vast.ai",
    "executor.runpod": "RunPod",
    "executor.vastPlanned": "Kết nối Vast.ai (dự kiến)",
    "executor.runpodPlanned": "Kết nối RunPod (dự kiến)",
    "job.belowBy": "{gpu} dưới {price} trước {deadline}",
    "job.attempt": "{executor} · lần {current}/{total}",
    "job.cancel": "Hủy",
    "job.summary.queued": "Đang chờ {gpu} ở mức {price}/GPU giờ hoặc thấp hơn.",
    "job.summary.dispatching": "Đang điều phối đến mục tiêu phù hợp.",
    "job.summary.running": "Đang chạy trên mục tiêu đã chọn.",
    "job.summary.retrying": "Sẽ thử lại ở khung giá rẻ tiếp theo.",
    "job.summary.complete": "Tác vụ đã hoàn tất.",
    "job.summary.failed": "Tác vụ thất bại.",
    "job.summary.expired": "Không có giá phù hợp trước hạn.",
    "job.summary.canceled": "Tác vụ đã bị hủy.",
    "recommendation.wait.label": "Chưa có dữ liệu thị trường",
    "recommendation.wait.action": "Chờ",
    "recommendation.wait.detail": "Bộ thu thập chưa trả về giá.",
    "recommendation.run.label": "Chạy ngay",
    "recommendation.run.action": "Chạy",
    "recommendation.run.detail": "{provider} {gpu} thấp hơn trung bình gần đây {percent}%.",
    "recommendation.run.detailFallback": "{provider} {gpu} hiện thấp hơn trung bình gần đây.",
    "recommendation.defer.label": "Trì hoãn",
    "recommendation.defer.action": "Chờ",
    "recommendation.defer.detail": "Giá rẻ nhất hiện cao hơn trung bình gần đây {percent}%.",
    "recommendation.defer.detailFallback": "Giá rẻ nhất hiện cao hơn trung bình gần đây.",
    "recommendation.watch.label": "Theo dõi",
    "recommendation.watch.action": "Theo dõi",
    "recommendation.watch.detail": "Giá đang gần mức trung bình gần đây."
  },
  pt: {
    "document.title": "AI Compute Weather",
    "hero.title": "Roteador de computação fora do pico",
    "language.label": "Idioma",
    "refresh": "Atualizar",
    "exportCsv": "Exportar CSV",
    "marketSummary": "Resumo do mercado",
    "metric.cheapest": "Mais barato",
    "metric.signal": "Sinal",
    "metric.liveOffers": "Ofertas ao vivo",
    "metric.queuedJobs": "Tarefas na fila",
    "market.eyebrow": "Mercado",
    "market.title": "Preços de GPU",
    "filter.gpu": "Filtro de GPU",
    "filter.provider": "Filtro de provedor",
    "table.provider": "Provedor",
    "table.gpu": "GPU",
    "table.region": "Região",
    "table.instance": "Instância",
    "table.price": "$/GPU h",
    "table.source": "Fonte",
    "dispatch.eyebrow": "Despacho",
    "queue.eyebrow": "Fila",
    "form.name": "Nome",
    "form.gpu": "GPU",
    "form.executor": "Executor",
    "form.command": "Comando",
    "form.maxPrice": "Máx. $/GPU h",
    "form.retries": "Tentativas",
    "form.timeout": "Timeout s",
    "form.deadline": "Prazo h",
    "form.queueJob": "Adicionar tarefa",
    "trend.eyebrow": "Tendência",
    "trend.title": "Preço mais baixo",
    "trend.samples": "Últimas 96 amostras",
    "jobs.eyebrow": "Tarefas",
    "jobs.title": "Fila batch",
    "all": "Todos",
    "any": "Qualquer",
    "noQueuedJobs": "Nenhuma tarefa na fila",
    "totalOffers": "{count} ofertas no total",
    "runningCount": "{count} em execução",
    "offersCount": "{count} ofertas",
    "latencyMs": "{ms} ms",
    "chart.waiting": "Aguardando amostras de preço",
    "sourceType.live": "ao vivo",
    "sourceType.proxy": "proxy",
    "status.queued": "na fila",
    "status.dispatching": "despachando",
    "status.running": "em execução",
    "status.retrying": "tentando novamente",
    "status.complete": "concluído",
    "status.failed": "falhou",
    "status.expired": "expirado",
    "status.canceled": "cancelado",
    "status.ready": "pronto",
    "status.local-only": "somente local",
    "status.planned": "planejado",
    "status.configured": "configurado",
    "status.live": "ao vivo",
    "status.degraded": "degradado",
    "executor.dry-run": "Simulação",
    "executor.local": "Comando local",
    "executor.vast": "Vast.ai",
    "executor.runpod": "RunPod",
    "executor.vastPlanned": "Conector Vast.ai (planejado)",
    "executor.runpodPlanned": "Conector RunPod (planejado)",
    "job.belowBy": "{gpu} abaixo de {price} até {deadline}",
    "job.attempt": "{executor} · tentativa {current}/{total}",
    "job.cancel": "Cancelar",
    "job.summary.queued": "Aguardando {gpu} a {price}/GPU hora ou menos.",
    "job.summary.dispatching": "Despachando para o destino de execução correspondente.",
    "job.summary.running": "Executando no destino selecionado.",
    "job.summary.retrying": "Tentando novamente na próxima janela barata.",
    "job.summary.complete": "Tarefa concluída.",
    "job.summary.failed": "A tarefa falhou.",
    "job.summary.expired": "Nenhum preço compatível chegou antes do prazo.",
    "job.summary.canceled": "Tarefa cancelada.",
    "recommendation.wait.label": "Sem dados de mercado",
    "recommendation.wait.action": "Aguardar",
    "recommendation.wait.detail": "Os coletores ainda não retornaram ofertas.",
    "recommendation.run.label": "Executar agora",
    "recommendation.run.action": "Executar",
    "recommendation.run.detail": "{provider} {gpu} está {percent}% abaixo da média recente.",
    "recommendation.run.detailFallback": "{provider} {gpu} está abaixo da média recente.",
    "recommendation.defer.label": "Adiar",
    "recommendation.defer.action": "Aguardar",
    "recommendation.defer.detail": "O menor preço atual está {percent}% acima da média recente.",
    "recommendation.defer.detailFallback": "O menor preço atual está acima da média recente.",
    "recommendation.watch.label": "Monitorar",
    "recommendation.watch.action": "Monitorar",
    "recommendation.watch.detail": "Os preços estão próximos da média recente."
  }
};

const state = {
  snapshot: null,
  gpuFilter: "all",
  providerFilter: "all",
  language: detectLanguage()
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  languageSelect: $("#languageSelect"),
  refreshButton: $("#refreshButton"),
  cheapestMetric: $("#cheapestMetric"),
  cheapestSub: $("#cheapestSub"),
  signalMetric: $("#signalMetric"),
  signalSub: $("#signalSub"),
  liveMetric: $("#liveMetric"),
  sourceSub: $("#sourceSub"),
  queueMetric: $("#queueMetric"),
  queueSub: $("#queueSub"),
  gpuFilter: $("#gpuFilter"),
  providerFilter: $("#providerFilter"),
  jobGpu: $("#jobGpu"),
  offerRows: $("#offerRows"),
  decisionTitle: $("#decisionTitle"),
  decisionDetail: $("#decisionDetail"),
  updatedAt: $("#updatedAt"),
  priceChart: $("#priceChart"),
  jobForm: $("#jobForm"),
  jobList: $("#jobList"),
  sources: $("#sources")
};

applyTranslations();

elements.languageSelect.value = state.language;
elements.languageSelect.addEventListener("change", () => {
  state.language = supportedLanguage(elements.languageSelect.value) || "ja";
  saveLanguage(state.language);
  applyTranslations();
  syncFilters();
  render();
});

elements.refreshButton.addEventListener("click", async () => {
  elements.refreshButton.disabled = true;
  try {
    await loadSnapshot("/api/refresh", { method: "POST" });
  } finally {
    elements.refreshButton.disabled = false;
  }
});

elements.gpuFilter.addEventListener("change", () => {
  state.gpuFilter = elements.gpuFilter.value;
  render();
});

elements.providerFilter.addEventListener("change", () => {
  state.providerFilter = elements.providerFilter.value;
  render();
});

elements.jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(elements.jobForm);
  const payload = Object.fromEntries(form.entries());
  payload.maxPriceUsdGpuHour = Number(payload.maxPriceUsdGpuHour);
  payload.deadlineHours = Number(payload.deadlineHours);
  payload.retryLimit = Number(payload.retryLimit);
  payload.timeoutSeconds = Number(payload.timeoutSeconds);

  await fetch("/api/jobs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  await loadSnapshot();
});

elements.jobList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-cancel-job]");
  if (!button) return;
  button.disabled = true;
  await fetch(`/api/jobs/${encodeURIComponent(button.dataset.cancelJob)}/cancel`, { method: "POST" });
  await loadSnapshot();
});

await loadSnapshot();
setInterval(() => loadSnapshot().catch(() => {}), 30_000);

async function loadSnapshot(url = "/api/snapshot", options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  state.snapshot = await response.json();
  syncFilters();
  render();
}

function applyTranslations() {
  document.documentElement.lang = state.language;
  document.title = t("document.title");

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }

  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  }
}

function syncFilters() {
  const offers = state.snapshot?.offers || [];
  const gpuValues = ["all", ...unique(offers.map((offer) => offer.gpu))];
  const providerValues = ["all", ...unique(offers.map((offer) => offer.provider))];
  const jobGpuValues = unique(offers.map((offer) => offer.gpu));

  fillSelect(elements.gpuFilter, gpuValues, state.gpuFilter);
  fillSelect(elements.providerFilter, providerValues, state.providerFilter);
  fillSelect(elements.jobGpu, jobGpuValues, elements.jobGpu.value || "A100");
}

function fillSelect(select, values, selected) {
  if (!values.length) {
    select.innerHTML = "";
    return;
  }

  const current = values.includes(selected) ? selected : values[0];
  select.innerHTML = values.map((value) => {
    const label = selectableLabel(value);
    return `<option value="${escapeHtml(value)}"${value === current ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }).join("");
}

function render() {
  const snapshot = state.snapshot;
  if (!snapshot) return;

  const offers = snapshot.offers || [];
  const filtered = offers
    .filter((offer) => state.gpuFilter === "all" || offer.gpu === state.gpuFilter)
    .filter((offer) => state.providerFilter === "all" || offer.provider === state.providerFilter);
  const cheapest = filtered[0] || offers[0];
  const liveOffers = offers.filter((offer) => offer.sourceType === "live");
  const queued = snapshot.jobs.filter((job) => job.status === "queued").length;
  const running = snapshot.jobs.filter((job) => job.status === "running").length;
  const recommendation = localizedRecommendation(snapshot.recommendation, offers, snapshot.history || []);

  elements.cheapestMetric.textContent = cheapest ? money(cheapest.priceUsdGpuHour) : "$--";
  elements.cheapestSub.textContent = cheapest ? `${cheapest.provider} ${cheapest.gpu} ${cheapest.region}` : "--";
  elements.signalMetric.textContent = recommendation.label;
  elements.signalSub.textContent = recommendation.action;
  elements.liveMetric.textContent = String(liveOffers.length);
  elements.sourceSub.textContent = t("totalOffers", { count: offers.length });
  elements.queueMetric.textContent = String(queued);
  elements.queueSub.textContent = t("runningCount", { count: running });
  elements.updatedAt.textContent = snapshot.lastRefresh ? new Date(snapshot.lastRefresh).toLocaleTimeString(currentLocale()) : "--";

  elements.decisionTitle.textContent = recommendation.label;
  elements.decisionDetail.textContent = recommendation.detail;

  renderRows(filtered.slice(0, 80));
  renderJobs(snapshot.jobs);
  renderSources(snapshot.sourceHealth);
  drawChart(snapshot.history || []);
}

function renderRows(offers) {
  elements.offerRows.innerHTML = offers.map((offer) => `
    <tr>
      <td title="${escapeHtml(offer.provider)}">${escapeHtml(offer.provider)}</td>
      <td>${escapeHtml(offer.gpu)} x${offer.gpuCount}</td>
      <td title="${escapeHtml(offer.location || offer.region)}">${escapeHtml(offer.region)}</td>
      <td title="${escapeHtml(offer.instance)}">${escapeHtml(offer.instance)}</td>
      <td class="price">${money(offer.priceUsdGpuHour)}</td>
      <td><span class="badge ${offer.sourceType === "proxy" ? "proxy" : ""}">${escapeHtml(sourceTypeLabel(offer.sourceType))}</span></td>
    </tr>
  `).join("");
}

function renderJobs(jobs) {
  if (!jobs.length) {
    elements.jobList.innerHTML = `<div class="job-item"><div class="job-meta">${escapeHtml(t("noQueuedJobs"))}</div></div>`;
    return;
  }

  elements.jobList.innerHTML = jobs.slice(0, 20).map((job) => {
    const deadline = new Date(job.deadline).toLocaleString(currentLocale());
    const executor = executorLabel(job.executor || "dry-run");
    const attempts = Number(job.attempts || 0);
    const totalAttempts = Number(job.retryLimit || 0) + 1;
    const selectedOffer = job.selectedOffer
      ? ` · ${job.selectedOffer.provider} ${job.selectedOffer.region} ${money(job.selectedOffer.priceUsdGpuHour)}`
      : "";

    return `
      <article class="job-item">
        <div class="job-main">
          <div class="job-name" title="${escapeHtml(job.name)}">${escapeHtml(job.name)}</div>
          <span class="status ${escapeHtml(job.status)}">${escapeHtml(statusLabel(job.status))}</span>
        </div>
        <div class="job-meta">
          ${escapeHtml(t("job.belowBy", {
            gpu: gpuLabel(job.gpu),
            price: money(job.maxPriceUsdGpuHour),
            deadline
          }))}
        </div>
        <div class="job-meta">
          ${escapeHtml(t("job.attempt", { executor, current: attempts, total: totalAttempts }))}${escapeHtml(selectedOffer)}
        </div>
        <div class="job-meta">${escapeHtml(jobSummary(job))}</div>
        ${job.logs?.length ? `<div class="job-log">${job.logs.slice(-3).map((log) => `<div class="log-line ${escapeHtml(log.stream)}"><span>${escapeHtml(log.stream)}</span>${escapeHtml(log.message)}</div>`).join("")}</div>` : ""}
        ${["queued", "dispatching", "running", "retrying"].includes(job.status) ? `<div class="job-actions"><button class="button secondary mini" type="button" data-cancel-job="${escapeHtml(job.id)}">${escapeHtml(t("job.cancel"))}</button></div>` : ""}
      </article>
    `;
  }).join("");
}

function renderSources(sourceHealth = {}) {
  elements.sources.innerHTML = Object.entries(sourceHealth).map(([name, health]) => `
    <article>
      <h3><span class="live-dot ${escapeHtml(health.status)}"></span>${escapeHtml(labelCase(name))}</h3>
      <p>${escapeHtml(statusLabel(health.status))} · ${escapeHtml(t("offersCount", { count: Number(health.offers || 0) }))} · ${escapeHtml(t("latencyMs", { ms: Number(health.latencyMs || 0) }))}</p>
      <p>${escapeHtml(health.label || "")}</p>
    </article>
  `).join("");
}

function drawChart(history) {
  const canvas = elements.priceChart;
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, width, height);

  const pad = { left: 50, right: 18, top: 18, bottom: 34 };
  const values = history.map((point) => point.cheapestAny).filter((value) => Number.isFinite(value));
  if (values.length < 2) {
    ctx.fillStyle = "#64748d";
    ctx.font = chartFont(14);
    ctx.fillText(t("chart.waiting"), pad.left, height / 2);
    return;
  }

  const min = Math.min(...values) * 0.92;
  const max = Math.max(...values) * 1.08;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  ctx.strokeStyle = "#e3e8ee";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#64748d";
  ctx.font = chartFont(12);
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i += 1) {
    const value = max - ((max - min) / 4) * i;
    const y = pad.top + (plotH / 4) * i + 4;
    ctx.fillText(money(value), pad.left - 8, y);
  }

  const points = history
    .map((point, index) => ({ value: point.cheapestAny, index }))
    .filter((point) => Number.isFinite(point.value));

  ctx.strokeStyle = "#533afd";
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, i) => {
    const x = pad.left + (plotW * point.index) / Math.max(1, history.length - 1);
    const y = pad.top + plotH - ((point.value - min) / (max - min || 1)) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const last = points[points.length - 1];
  const x = pad.left + (plotW * last.index) / Math.max(1, history.length - 1);
  const y = pad.top + plotH - ((last.value - min) / (max - min || 1)) * plotH;
  ctx.fillStyle = "#ea2261";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function localizedRecommendation(recommendation, offers, history) {
  const action = recommendation?.action || "wait";
  const cheapest = offers?.[0];
  const ratio = recentPriceRatio(history, cheapest?.priceUsdGpuHour);
  const safeAction = ["wait", "run", "defer", "watch"].includes(action) ? action : "watch";

  if (safeAction === "run" && cheapest) {
    const percent = Number.isFinite(ratio) ? Math.round((1 - ratio) * 100) : null;
    return {
      label: t("recommendation.run.label"),
      action: t("recommendation.run.action"),
      detail: percent !== null
        ? t("recommendation.run.detail", { provider: cheapest.provider, gpu: cheapest.gpu, percent })
        : t("recommendation.run.detailFallback", { provider: cheapest.provider, gpu: cheapest.gpu })
    };
  }

  if (safeAction === "defer") {
    const percent = Number.isFinite(ratio) ? Math.round((ratio - 1) * 100) : null;
    return {
      label: t("recommendation.defer.label"),
      action: t("recommendation.defer.action"),
      detail: percent !== null
        ? t("recommendation.defer.detail", { percent })
        : t("recommendation.defer.detailFallback")
    };
  }

  return {
    label: t(`recommendation.${safeAction}.label`),
    action: t(`recommendation.${safeAction}.action`),
    detail: t(`recommendation.${safeAction}.detail`)
  };
}

function recentPriceRatio(history, currentPrice) {
  if (!Number.isFinite(Number(currentPrice))) return null;
  const values = (history || [])
    .map((point) => point.cheapestAny)
    .filter((value) => Number.isFinite(value));
  if (values.length < 2) return null;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (!average) return null;
  return Number(currentPrice) / average;
}

function jobSummary(job) {
  if (job.status === "queued") {
    return t("job.summary.queued", {
      gpu: gpuLabel(job.gpu),
      price: money(job.maxPriceUsdGpuHour)
    });
  }
  return t(`job.summary.${job.status}`);
}

function executorLabel(value) {
  return t(`executor.${value}`) || String(value);
}

function sourceTypeLabel(value) {
  return t(`sourceType.${value}`) || String(value);
}

function statusLabel(value) {
  return t(`status.${value}`) || String(value);
}

function selectableLabel(value) {
  if (value === "all") return t("all");
  if (value === "any") return t("any");
  return value;
}

function gpuLabel(value) {
  if (value === "any") return t("any");
  return value || t("any");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, currentLocale()));
}

function money(value) {
  if (!Number.isFinite(Number(value))) return "$--";
  try {
    return new Intl.NumberFormat(currentLocale(), {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value));
  } catch {
    return `$${Number(value).toFixed(2)}`;
  }
}

function t(key, params = {}) {
  const dictionary = translations[state.language] || translations.ja;
  const template = dictionary[key] ?? translations.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ""));
}

function currentLocale() {
  return languageOptions.find((option) => option.code === state.language)?.locale || "ja-JP";
}

function supportedLanguage(value) {
  const normalized = String(value || "").toLowerCase();
  const direct = languageOptions.find((option) => option.code === normalized || option.locale.toLowerCase() === normalized);
  if (direct) return direct.code;

  const base = normalized.split("-")[0];
  return languageOptions.find((option) => option.code === base)?.code || null;
}

function detectLanguage() {
  const saved = readSavedLanguage();
  if (saved) return saved;

  for (const candidate of navigator.languages || [navigator.language]) {
    const supported = supportedLanguage(candidate);
    if (supported) return supported;
  }
  return "ja";
}

function readSavedLanguage() {
  try {
    return supportedLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore private browsing or restricted storage modes.
  }
}

function chartFont(size) {
  return `${size}px Inter, "Noto Sans", "Noto Sans CJK JP", system-ui, sans-serif`;
}

function labelCase(value) {
  return String(value).replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
