use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri_plugin_autostart::MacosLauncher;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, Runtime,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

pub struct VuState(pub Mutex<Option<cpal::Stream>>);

unsafe impl Send for VuState {}
unsafe impl Sync for VuState {}

#[tauri::command]
fn start_vu(state: tauri::State<'_, VuState>, window: tauri::WebviewWindow) -> Result<(), String> {
    // Prefer WASAPI for loopback capture on Windows
    let host = {
        #[cfg(target_os = "windows")]
        {
            cpal::host_from_id(
                cpal::available_hosts()
                    .into_iter()
                    .find(|&id| id == cpal::HostId::Wasapi)
                    .unwrap_or_else(|| cpal::default_host().id()),
            )
            .unwrap_or_else(|_| cpal::default_host())
        }
        #[cfg(not(target_os = "windows"))]
        cpal::default_host()
    };

    let device = host
        .default_output_device()
        .ok_or("No output device found")?;

    let config = device
        .default_output_config()
        .map_err(|e| e.to_string())?;

    let win = window.clone();

    let stream = match config.sample_format() {
        cpal::SampleFormat::F32 => device.build_input_stream(
            &config.into(),
            move |data: &[f32], _| {
                let peak = data.iter().map(|s| s.abs()).fold(0.0f32, f32::max);
                let amp = (peak * 4.0).min(1.0);
                let _ = win.emit("vu-data", amp);
            },
            |e| eprintln!("VU stream error: {e}"),
            None,
        ),
        cpal::SampleFormat::I16 => {
            let win2 = window.clone();
            device.build_input_stream(
                &config.into(),
                move |data: &[i16], _| {
                    let peak = data.iter().map(|s| (*s as f32 / i16::MAX as f32).abs()).fold(0.0f32, f32::max);
                    let amp = (peak * 4.0).min(1.0);
                    let _ = win2.emit("vu-data", amp);
                },
                |e| eprintln!("VU stream error: {e}"),
                None,
            )
        }
        fmt => return Err(format!("Unsupported sample format: {fmt:?}")),
    }
    .map_err(|e| e.to_string())?;

    stream.play().map_err(|e| e.to_string())?;

    let mut guard = state.0.lock().unwrap();
    *guard = Some(stream);
    Ok(())
}

#[tauri::command]
fn stop_vu(state: tauri::State<'_, VuState>) {
    let mut guard = state.0.lock().unwrap();
    *guard = None;
}

pub fn run() {
    tauri::Builder::default()
        .manage(VuState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![start_vu, stop_vu])
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        .setup(|app| {
            let handle = app.handle().clone();

            // ── Global shortcut: Ctrl+Shift+A → show/hide window ──────────
            let shortcut = Shortcut::new(
                Some(Modifiers::CONTROL | Modifiers::SHIFT),
                Code::KeyA,
            );
            let last_toggle = Arc::new(Mutex::new(
                Instant::now() - Duration::from_secs(1),
            ));
            app.global_shortcut().on_shortcut(shortcut, move |_app, _sh, _event| {
                let mut last = last_toggle.lock().unwrap();
                if last.elapsed() < Duration::from_millis(300) {
                    return;
                }
                *last = Instant::now();
                drop(last);
                toggle_window(&handle);
            })?;

            // ── System tray ───────────────────────────────────────────────
            let handle2 = app.handle().clone();
            let quit = MenuItem::with_id(app, "quit", "Quit Assistask", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show / Hide", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Assistask")
                .on_menu_event(move |_app, event| match event.id.as_ref() {
                    "quit" => std::process::exit(0),
                    "show" => toggle_window(&handle2),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        toggle_window(app);
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Assistask");
}

fn toggle_window<R: Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}
