# 图 48-4 Explore 分支

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
  EX([Explore more]) --> RET2[retrieve<br/>过滤已见 URL]
  RET2 --> EN2[enrich<br/>合并引用/卡片]
  EN2 --> DONE2([更新原消息])

  classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
  classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
  classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
  class EX bpInfo
  class RET2,EN2 bpProcess
  class DONE2 bpSuccess
  linkStyle default stroke:#697077,stroke-width:2px
```
