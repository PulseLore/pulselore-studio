# PulseLore AI Music Meter Backend Plan

This prototype is static-hosting friendly. v0.2 includes browser-only basic audio metrics using Web Audio API / AudioContext / decodeAudioData where the browser supports the selected file.

## Enabled in v0.2

- Local browser audio decoding for selected files
- File name and file size display
- Duration, sample rate, and channel count
- Peak and RMS level estimates
- Clipping risk estimate
- Silence at start/end estimate
- Basic dynamic range estimate
- Stereo balance estimate when stereo audio is available
- LocalStorage report handoff from upload page to report page

No audio is uploaded to PulseLore.Studio in v0.2. Do not use Hercules Files & Media for this version.

## Not enabled yet

- Real audio upload
- Server-side audio analysis
- 24-hour auto-delete backend
- Google login
- Supabase database
- Temporary audio storage
- Python audio analyzer
- Cron job / scheduled deletion
- Python FastAPI audio analyzer
- ffmpeg audio processing
- spectral feature extraction
- temporal feature extraction
- AI/Human/Hybrid risk scoring

## Future integration structure

### Auth

- Provider: Google login
- Store user profile in Supabase
- Roles:
  - `user`: limited checks per month
  - `internal`: expanded checks for approved internal accounts

### Database fields

`music_meter_checks`

- `id`
- `user_id`
- `email`
- `role`
- `monthly_limit`
- `used_count`
- `upload_id`
- `song_title`
- `artist_name`
- `generated_by`
- `language`
- `genre`
- `upload_time`
- `delete_deadline`
- `deleted_at`
- `consent_checked`
- `policy_version`
- `report_score`
- `report_text`
- `status`

`audit_log`

- `id`
- `user_id`
- `upload_id`
- `event_type`
- `event_time`
- `metadata`

Events:

- `uploaded`
- `analyzed`
- `manually_deleted`
- `auto_deleted`

### Storage

- Store audio in temporary private storage.
- Never use uploaded audio for AI training.
- Never sell, publish, share publicly, or distribute uploaded audio.
- Delete original audio manually on request or automatically within 24 hours.
- Keep lightweight report metadata only after deletion.

### Analyzer

- Python FastAPI audio analyzer service.
- ffmpeg audio processing for MP3, WAV, and FLAC normalization.
- Planned checks:
  - spectral feature extraction
  - temporal feature extraction
  - AI/Human/Hybrid risk scoring
  - loudness / mastering safety
  - clipping risk
  - noise / static risk
  - stereo / dynamic balance
  - AI artifact risk heuristics
  - metadata / release checklist
  - fix recommendations

### Cron job

- Run at least once per hour.
- Find uploads older than 24 hours with no `deleted_at`.
- Delete storage object.
- Set `deleted_at`.
- Add `auto_deleted` audit event.

### Frontend connection points

- `music-meter/index.html` or a future dedicated upload route if created later
  - Replace or extend the current local-only file picker with a real upload control.
  - Connect consent checkbox to upload submission.
  - Show real quota count from Supabase.

- `music-meter/report/index.html`
  - Replace sample report values with analyzer response.
  - Connect Delete Audio Now button to deletion endpoint.
  - Connect Download / Copy Report to generated report text.
