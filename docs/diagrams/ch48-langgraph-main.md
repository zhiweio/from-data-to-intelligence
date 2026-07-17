# 图 48-3 FieldGenie 主路径

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#edf5ff','primaryTextColor':'#161616','primaryBorderColor':'#0f62fe','lineColor':'#697077','secondaryColor':'#d9fbfb','tertiaryColor':'#f2f4f8','fontSize':'14px'}}}%%
flowchart LR
  START([提问]) --> CACHE[check_cache]
  CACHE --> RET[retrieve]
  RET --> GEN[generate]
  GEN --> EN[enrich]
  EN --> ENDN([落库 + done])

  classDef bpProcess fill:#edf5ff,stroke:#0f62fe,stroke-width:2px,color:#161616
  classDef bpSuccess fill:#defbe6,stroke:#198038,stroke-width:2px,color:#161616
  classDef bpInfo fill:#f6f2ff,stroke:#8a3ffc,stroke-width:2px,color:#161616
  class START bpInfo
  class CACHE,RET,GEN,EN bpProcess
  class ENDN bpSuccess
  linkStyle default stroke:#697077,stroke-width:2px
```
