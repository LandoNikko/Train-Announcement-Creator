# 電車アナウンス制作ツール

> **⚠️ 開発初期版**

路線図デザインと音声アナウンスが作れるWebツールです。

ElevenLabs APIによるAI音声生成に対応。音声ファイルのアップロードやプリセット音声も利用可能。プロジェクトはJSON形式で保存・読み込みができます。

**試してみる**: https://landonikko.github.io/Train-Announcement-Creator

![JP](https://i.imgur.com/2R6pmGs.jpeg)

**注目ポイント**:
- 駅間のアナウンスも個別に設定可能
- 3種類の路線スタイル（直線、90度コーナー、スムーズカーブ）
- アナウンスの再生順序を自動管理する音声キュー機能
- 再生中の駅をマップ上でリアルタイム表示
- 多言語対応（日本語・英語）
- ダークモード対応
- 完全な履歴管理（Undo/Redo）

**主な技術スタック**:
- React + Vite
- Tailwind CSS
- D3.js (路線図描画)
- ElevenLabs API (音声生成)

---

# Train Announcement Creator

> **⚠️ Early Prototype**

Web tool for designing train route maps with audio announcements.

Supports AI voice generation with ElevenLabs API. You can also upload your own audio files or use preset sounds. Projects can be saved and loaded as JSON files.

**Try it here**: https://landonikko.github.io/Train-Announcement-Creator

![EN](https://i.imgur.com/x8WWTH8.jpeg)

**Highlights**:
- Individual audio assignments for between-station segments
- Three line styles (direct, 90° corners, smooth curves)
- Audio queue for automatic playback sequencing
- Real-time station highlighting during playback
- Multilingual support (Japanese & English)
- Dark mode
- Full history management (Undo/Redo)

**Tech Stack**:
- React + Vite
- Tailwind CSS
- D3.js (route visualization)
- ElevenLabs API (voice generation)
