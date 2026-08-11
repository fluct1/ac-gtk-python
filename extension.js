
const vscode = require('vscode');
let signalsCache = [];

function activate(context) {
    const provider = vscode.languages.registerCompletionItemProvider('python', {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            const fullText = document.getText();

            // --- نظام المزامنة (The Sync Engine) ---
            //هنا تحديث المصفوفة
            const signalRegex = /connect\s*\([^,]+,\s*self\.(\w+)\)/g;
            let match;
            let currentSignals = [];

            while ((match = signalRegex.exec(fullText)) !== null) {
                if (!currentSignals.includes(match[1])) {
                    currentSignals.push(match[1]);
                }
            }
            // تحديث الحالة الحالية (يمسح القديم، يضيف الجديد، يعدل الموجود)
            signalsCache = currentSignals;

            // --- تنفيذ ميزة عند كتابة def ---
            if (linePrefix.match(/def\s+\w*$/)) {
                let suggestions = [
                    {
                        label: '__init__',
                        detail: 'def __init__(self):',
                        docs: 'DOC?',
                        insert: '__init__(self):'
                    }
                ];

                // إضافة كل ما في مصفوفة للاقتراحات
                signalsCache.forEach(signalName => {
                    suggestions.push({
                        label: signalName,
                        detail: `Callback function for signal`,
                        docs: `DOC?`,
                        insert: `${signalName}(self, widget):\n\t\${0:pass}`
                    });
                });

                return suggestions.map(s => createItem(s, vscode.CompletionItemKind.Function));
            }

            // import suggests ============================================
            const giMatch = linePrefix.match(/from\s+gi\.repository\s+import\s+([^]*)$/);

            if (giMatch) {
                const alreadyImported = giMatch[1];
                let importRes = [];

                const allLib = [
                    {
                        label: 'Gtk',
                        detail: 'Lib',
                        docs: 'DOC?',
                        insert: 'Gtk'
                    },
                    {
                        label: 'Gdk',
                        detail: 'Lib',
                        docs: 'DOC?',
                        insert: 'Gdk'
                    },
                    {
                        label: 'GdkPixbuf',
                        detail: 'Lib',
                        docs: 'DOC?',
                        insert: 'GdkPixbuf'
                    },
                    {
                        label: 'GObject',
                        detail: 'GObject',
                        docs: 'DOC?',
                        insert: 'GObject'
                    }
                ];
                allLib.forEach(lib => {
                    const isAlready = new RegExp(`\\b${lib.label}\\b`).test(alreadyImported);

                    if (!isAlready){
                        importRes.push(createItem(lib, vscode.CompletionItemKind.Module));
                    }
                });
                return importRes;
            }
            // ----------------------------------------------------------------------- |

            // ===================================================
            // MainCode Inheartence Tree                         |
            // ===================================================


            /// ================================================================== |
            // - Inheartence Code Array For Call in anywhere
            /// ================================================================== |

            const GObjectMethodInheartence = [
                {
                    label: 'connect',
                    detail: 'connect(signal, handler)',
                    docs: 'DOC?',
                    insert: 'connect($1)'
                },
                {
                    label: 'disconnect',
                    detail: 'disconnect(id)',
                    docs: 'DOC?',
                    insert: 'disconnect($1)'
                },
                {
                    label: 'emit',
                    detail: 'emit(signal, *args)',
                    docs: 'DOC?',
                    insert: 'emit($1)'
                },
                {
                    label: 'bind_property',
                    detail: 'bind_property(source, target, target_prop, flags)',
                    docs: 'DOC?',
                    insert: 'bind_property($1)'
                },
                {
                    label: 'get_property',
                    detail: 'get_property(name)',
                    docs: 'DOC?',
                    insert: 'get_property("$1")'
                },
                {
                    label: 'set_property',
                    detail: 'set_property(name, value)',
                    docs: 'DOC?',
                    insert: 'set_property("$1")'
                },
                {
                    label: 'handler_block',
                    detail: 'handler_block()',
                    docs: 'DOC?',
                    insert: 'handler_block($1)'
                },
                {
                    label: 'handler_unblock',
                    detail: 'handler_unblock()',
                    docs: 'DOC?',
                    insert: 'handler_unblock($1)'
                },
                {
                    label: 'handler_disconnect',
                    detail: 'handler_disconnect',
                    docs: 'DOC?',
                    insert: 'handler_disconnect($1)'
                },
                {
                    label: 'handler_is_connected',
                    detail: 'handler_is_connected()',
                    docs: 'DOC?',
                    insert: 'handler_is_connected($1)'
                },
                {
                    label: 'freeze_notify',
                    detail: 'freeze_notify()',
                    docs: 'DOC?',
                    insert: 'freeze_notify()'
                },
                {
                    label: 'thaw_notify',
                    detail: 'thaw_notify()',
                    docs: 'DOC?',
                    insert: 'thaw_notify($1)'
                },
                {
                    label: 'notify',
                    detail: 'notify()',
                    docs: 'DOC?',
                    insert: 'notify("$1")'
                },
                {
                    label: 'props',
                    detail: 'props.propertie_name',
                    docs: 'DOC?',
                    insert: 'props'
                },
                {
                    label: 'bind_property_full',
                    detail: 'bind_property_full()',
                    docs: 'DOC?',
                    insert: 'bind_property_full($1)'
                },
                {
                    label: 'connect_after',
                    detail: 'connect_after()',
                    docs: 'DOC?',
                    insert: 'connect_after($1)'
                },
                {
                    label: 'compat_control',
                    detail: 'compat_control()',
                    docs: 'DOC?',
                    insert: 'compat_control($1)'
                },
                {
                    label: 'find_property',
                    detail: 'find_property()',
                    docs: 'DOC?',
                    insert: 'find_property($1)'
                },
                {
                    label: 'install_properties',
                    detail: 'install_properties()',
                    docs: 'DOC?',
                    insert: 'install_properties($1)'
                },
                {
                    label: 'install_property',
                    detail: 'install_property()',
                    docs: 'DOC?',
                    insert: 'install_property($1)'
                },
                {
                    label: 'interface_find_property',
                    detail: 'interface_find_property()',
                    docs: 'DOC?',
                    insert: 'interface_find_property($1)'
                },
                {
                    label: 'interface_install_property',
                    detail: 'interface_install_property()',
                    docs: 'DOC?',
                    insert: 'interface_install_property($1)'
                },
                {
                    label: 'interface_list_properties',
                    detail: 'interface_list_properties()',
                    docs: 'DOC?',
                    insert: 'interface_list_properties($1)'
                },
                {
                    label: 'list_properties',
                    detail: 'list_properties()',
                    docs: 'DOC?',
                    insert: 'list_properties($1)'
                },
                {
                    label: 'newv',
                    detail: 'newv()',
                    docs: 'DOC?',
                    insert: 'newv($1)'
                },
                {
                    label: 'override_property',
                    detail: 'override_property()',
                    docs: 'DOC?',
                    insert: 'override_property($1)'
                },
                {
                    label: 'force_floating',
                    detail: 'force_floating()',
                    docs: 'DOC?',
                    insert: 'force_floating()'
                },
                {
                    label: 'get_data',
                    detail: 'get_data()',
                    docs: 'DOC?',
                    insert: 'get_data($1)'
                },
                {
                    label: 'get_qdata',
                    detail: 'get_qdata()',
                    docs: 'DOC?',
                    insert: 'get_qdata($1)'
                },
                {
                    label: 'getv',
                    detail: 'getv()',
                    docs: 'DOC?',
                    insert: 'getv($1)'
                },
                {
                    label: 'is_floating',
                    detail: 'is_floating()',
                    docs: 'DOC?',
                    insert: 'is_floating()'
                },
                {
                    label: 'notify_by_pspec',
                    detail: 'notify_by_pspec()',
                    docs: 'DOC?',
                    insert: 'notify_by_pspec($1)'
                },
                {
                    label: 'ref',
                    detail: 'ref()',
                    docs: 'DOC?',
                    insert: 'ref()'
                },
                {
                    label: 'ref_sink',
                    detail: 'ref_sink()',
                    docs: 'DOC?',
                    insert: 'ref_sink()'
                },
                {
                    label: 'run_dispose',
                    detail: 'run_dispose()',
                    docs: 'DOC?',
                    insert: 'run_dispose()'
                },
                {
                    label: 'set_data',
                    detail: 'set_data()',
                    docs: 'DOC?',
                    insert: 'set_data($1)'
                },
                {
                    label: 'steal_data',
                    detail: 'steal_data()',
                    docs: 'DOC?',
                    insert: 'steal_data($1)'
                },
                {
                    label: 'steal_qdata',
                    detail: 'steal_qdata()',
                    docs: 'DOC?',
                    insert: 'steal_qdata($1)'
                },
                {
                    label: 'unref',
                    detail: 'unref()',
                    docs: 'DOC?',
                    insert: 'unref()'
                },
                {
                    label: 'watch_closure',
                    detail: 'watch_closure()',
                    docs: 'DOC?',
                    insert: 'watch_closure($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method))

            const GtkBuildableInheartence = [
                {
                    label: 'add_child',
                    detail: 'add_child()',
                    docs: 'DOC?',
                    insert: 'add_child($1)'
                },
                {
                    label: 'construct_child',
                    detail: 'construct_child()',
                    docs: 'DOC?',
                    insert: 'construct_child($1)'
                },
                {
                    label: 'custom_finished',
                    detail: 'custom_finished()',
                    docs: 'DOC?',
                    insert: 'custom_finished($1)'
                },
                {
                    label: 'custom_tag_end',
                    detail: 'custom_tag_end()',
                    docs: 'DOC?',
                    insert: 'custom_tag_end($1)'
                },
                {
                    label: 'custom_tag_start',
                    detail: 'custom_tag_start()',
                    docs: 'DOC?',
                    insert: 'custom_tag_start($1)'
                },
                {
                    label: 'get_internal_child',
                    detail: 'get_internal_child()',
                    docs: 'DOC?',
                    insert: 'get_internal_child($1)'
                },
                {
                    label: 'get_name',
                    detail: 'get_name()',
                    docs: 'DOC?',
                    insert: 'get_name()'
                },
                {
                    label: 'parser_finished',
                    detail: 'parser_finished()',
                    docs: 'DOC?',
                    insert: 'parser_finished($1)'
                },
                {
                    label: 'set_buildable_property',
                    detail: 'set_buildable_property()',
                    docs: 'DOC?',
                    insert: 'set_buildable_property($1)'
                },
                {
                    label: 'set_name',
                    detail: 'set_name()',
                    docs: 'DOC?',
                    insert: 'set_name($1)'
                },
            ].map(s => createItem(s, vscode.CompletionItemKind.Method))

            const GtkWidget = [
                {
                    label: 'bind_template_callback_full',
                    detail: 'bind_template_callback_full(callback_name, callback_symbol)',
                    docs: 'DOC?',
                    insert: 'bind_template_callback_full($1)'
                },
                {
                    label: 'bind_template_child_full',
                    detail: 'bind_template_child_full(name, internal_child, struct_offset)',
                    docs: 'DOC?',
                    insert: 'bind_template_child_full($1)'
                },
                {
                    label: 'find_style_property',
                    detail: 'find_style_property(property_name)',
                    docs: 'DOC?',
                    insert: 'find_style_property($1)'
                },
                {
                    label: 'get_css_name',
                    detail: 'get_css_name()',
                    docs: 'DOC?',
                    insert: 'get_css_name()'
                },
                {
                    label: 'get_default_direction',
                    detail: 'get_default_direction()',
                    docs: 'DOC?',
                    insert: 'get_default_direction()'
                },
                {
                    label: 'get_default_style',
                    detail: 'get_default_style()',
                    docs: 'DOC?',
                    insert: 'get_default_style()'
                },
                {
                    label: 'install_style_property',
                    detail: 'install_style_property(pspec)',
                    docs: 'DOC?',
                    insert: 'install_style_property($1)'
                },
                {
                    label: 'list_style_properties',
                    detail: 'list_style_properties()',
                    docs: 'DOC?',
                    insert: 'list_style_properties()'
                },
                {
                    label: 'pop_composite_child',
                    detail: 'pop_composite_child()',
                    docs: 'DOC?',
                    insert: 'pop_composite_child()'
                },
                {
                    label: 'push_composite_child',
                    detail: 'push_composite_child()',
                    docs: 'DOC?',
                    insert: 'push_composite_child()'
                },
                {
                    label: 'set_accessible_role',
                    detail: 'set_accessible_role(role)',
                    docs: 'DOC?',
                    insert: 'set_accessible_role($1)'
                },
                {
                    label: 'set_accessible_type',
                    detail: 'set_accessible_type(type)',
                    docs: 'DOC?',
                    insert: 'set_accessible_type($1)'
                },
                {
                    label: 'set_connect_func',
                    detail: 'set_connect_func(connect_func, *connect_data)',
                    docs: 'DOC?',
                    insert: 'set_connect_func($1)'
                },
                {
                    label: 'set_css_name',
                    detail: 'set_css_name(name)',
                    docs: 'DOC?',
                    insert: 'set_css_name($1)'
                },
                {
                    label: 'set_default_direction',
                    detail: 'set_default_direction(dir)',
                    docs: 'DOC?',
                    insert: 'set_default_direction($1)'
                },
                {
                    label: 'set_template',
                    detail: 'set_template(template_bytes)',
                    docs: 'DOC?',
                    insert: 'set_template($1)'
                },
                {
                    label: 'set_template_from_resource',
                    detail: 'set_template_from_resource(resource_name)',
                    docs: 'DOC?',
                    insert: 'set_template_from_resource($1)'
                },
                {
                    label: 'activate',
                    detail: 'activate()',
                    docs: 'DOC?',
                    insert: 'activate()'
                },
                {
                    label: 'add_accelerator',
                    detail: 'add_accelerator(accel_signal, accel_group, accel_key, accel_mods, accel_flags)',
                    docs: 'DOC?',
                    insert: 'add_accelerator($1)'
                },
                {
                    label: 'add_device_events',
                    detail: 'add_device_events(device, events)',
                    docs: 'DOC?',
                    insert: 'add_device_events($1)'
                },
                {
                    label: 'add_events',
                    detail: 'add_events(events)',
                    docs: 'DOC?',
                    insert: 'add_events($1)'
                },
                {
                    label: 'add_mnemonic_label',
                    detail: 'add_mnemonic_label(label)',
                    docs: 'DOC?',
                    insert: 'add_mnemonic_label($1)'
                },
                {
                    label: 'add_tick_callback',
                    detail: 'add_tick_callback(callback, *user_data)',
                    docs: 'DOC?',
                    insert: 'add_tick_callback($1)'
                },
                {
                    label: 'can_activate_accel',
                    detail: 'can_activate_accel(signal_id)',
                    docs: 'DOC?',
                    insert: 'can_activate_accel($1)'
                },
                {
                    label: 'child_focus',
                    detail: 'child_focus(direction)',
                    docs: 'DOC?',
                    insert: 'child_focus($1)'
                },
                {
                    label: 'child_notify',
                    detail: 'child_notify(child_property)',
                    docs: 'DOC?',
                    insert: 'child_notify($1)'
                },
                {
                    label: 'class_path',
                    detail: 'class_path()',
                    docs: 'DOC?',
                    insert: 'class_path()'
                },
                {
                    label: 'compute_expand',
                    detail: 'compute_expand(orientation)',
                    docs: 'DOC?',
                    insert: 'compute_expand($1)'
                },
                {
                    label: 'create_pango_context',
                    detail: 'create_pango_context()',
                    docs: 'DOC?',
                    insert: 'create_pango_context()'
                },
                {
                    label: 'create_pango_layout',
                    detail: 'create_pango_layout(text)',
                    docs: 'DOC?',
                    insert: 'create_pango_layout($1)'
                },
                {
                    label: 'destroy',
                    detail: 'destroy()',
                    docs: 'DOC?',
                    insert: 'destroy()'
                },
                {
                    label: 'destroyed',
                    detail: 'destroyed(widget_pointer)',
                    docs: 'DOC?',
                    insert: 'destroyed($1)'
                },
                {
                    label: 'device_is_shadowed',
                    detail: 'device_is_shadowed(device)',
                    docs: 'DOC?',
                    insert: 'device_is_shadowed($1)'
                },
                {
                    label: 'drag_begin',
                    detail: 'drag_begin(targets, actions, button, event)',
                    docs: 'DOC?',
                    insert: 'drag_begin($1)'
                },
                {
                    label: 'drag_begin_with_coordinates',
                    detail: 'drag_begin_with_coordinates(targets, actions, button, event, x, y)',
                    docs: 'DOC?',
                    insert: 'drag_begin_with_coordinates($1)'
                },
                {
                    label: 'drag_check_threshold',
                    detail: 'drag_check_threshold(start_x, start_y, current_x, current_y)',
                    docs: 'DOC?',
                    insert: 'drag_check_threshold($1)'
                },
                {
                    label: 'drag_dest_add_image_targets',
                    detail: 'drag_dest_add_image_targets()',
                    docs: 'DOC?',
                    insert: 'drag_dest_add_image_targets()'
                },
                {
                    label: 'drag_dest_add_text_targets',
                    detail: 'drag_dest_add_text_targets()',
                    docs: 'DOC?',
                    insert: 'drag_dest_add_text_targets()'
                },
                {
                    label: 'drag_dest_add_uri_targets',
                    detail: 'drag_dest_add_uri_targets()',
                    docs: 'DOC?',
                    insert: 'drag_dest_add_uri_targets()'
                },
                {
                    label: 'drag_dest_find_target',
                    detail: 'drag_dest_find_target(context, target_list)',
                    docs: 'DOC?',
                    insert: 'drag_dest_find_target($1)'
                },
                {
                    label: 'drag_dest_get_target_list',
                    detail: 'drag_dest_get_target_list()',
                    docs: 'DOC?',
                    insert: 'drag_dest_get_target_list()'
                },
                {
                    label: 'drag_dest_get_track_motion',
                    detail: 'drag_dest_get_track_motion()',
                    docs: 'DOC?',
                    insert: 'drag_dest_get_track_motion()'
                },
                {
                    label: 'drag_dest_set',
                    detail: 'drag_dest_set(flags, targets, actions)',
                    docs: 'DOC?',
                    insert: 'drag_dest_set($1)'
                },
                {
                    label: 'drag_dest_set_proxy',
                    detail: 'drag_dest_set_proxy(proxy_window, protocol, use_coordinates)',
                    docs: 'DOC?',
                    insert: 'drag_dest_set_proxy($1)'
                },
                {
                    label: 'drag_dest_set_target_list',
                    detail: 'drag_dest_set_target_list(target_list)',
                    docs: 'DOC?',
                    insert: 'drag_dest_set_target_list($1)'
                },
                {
                    label: 'drag_dest_set_track_motion',
                    detail: 'drag_dest_set_track_motion(track_motion)',
                    docs: 'DOC?',
                    insert: 'drag_dest_set_track_motion($1)'
                },
                {
                    label: 'drag_dest_unset',
                    detail: 'drag_dest_unset()',
                    docs: 'DOC?',
                    insert: 'drag_dest_unset()'
                },
                {
                    label: 'drag_get_data',
                    detail: 'drag_get_data(context, target, time_)',
                    docs: 'DOC?',
                    insert: 'drag_get_data($1)'
                },
                {
                    label: 'drag_highlight',
                    detail: 'drag_highlight()',
                    docs: 'DOC?',
                    insert: 'drag_highlight()'
                },
                {
                    label: 'drag_source_add_image_targets',
                    detail: 'drag_source_add_image_targets()',
                    docs: 'DOC?',
                    insert: 'drag_source_add_image_targets()'
                },
                {
                    label: 'drag_source_add_text_targets',
                    detail: 'drag_source_add_text_targets()',
                    docs: 'DOC?',
                    insert: 'drag_source_add_text_targets()'
                },
                {
                    label: 'drag_source_add_uri_targets',
                    detail: 'drag_source_add_uri_targets()',
                    docs: 'DOC?',
                    insert: 'drag_source_add_uri_targets()'
                },
                {
                    label: 'drag_source_get_target_list',
                    detail: 'drag_source_get_target_list()',
                    docs: 'DOC?',
                    insert: 'drag_source_get_target_list()'
                },
                {
                    label: 'drag_source_set',
                    detail: 'drag_source_set(start_button_mask, targets, actions)',
                    docs: 'DOC?',
                    insert: 'drag_source_set($1)'
                },
                {
                    label: 'drag_source_set_icon_gicon',
                    detail: 'drag_source_set_icon_gicon(icon)',
                    docs: 'DOC?',
                    insert: 'drag_source_set_icon_gicon($1)'
                },
                {
                    label: 'drag_source_set_icon_name',
                    detail: 'drag_source_set_icon_name(icon_name)',
                    docs: 'DOC?',
                    insert: 'drag_source_set_icon_name($1)'
                },
                {
                    label: 'drag_source_set_icon_pixbuf',
                    detail: 'drag_source_set_icon_pixbuf(pixbuf)',
                    docs: 'DOC?',
                    insert: 'drag_source_set_icon_pixbuf($1)'
                },
                {
                    label: 'drag_source_set_icon_stock',
                    detail: 'drag_source_set_icon_stock(stock_id)',
                    docs: 'DOC?',
                    insert: 'drag_source_set_icon_stock($1)'
                },
                {
                    label: 'drag_source_set_target_list',
                    detail: 'drag_source_set_target_list(target_list)',
                    docs: 'DOC?',
                    insert: 'drag_source_set_target_list($1)'
                },
                {
                    label: 'drag_source_unset',
                    detail: 'drag_source_unset()',
                    docs: 'DOC?',
                    insert: 'drag_source_unset()'
                },
                {
                    label: 'drag_unhighlight',
                    detail: 'drag_unhighlight()',
                    docs: 'DOC?',
                    insert: 'drag_unhighlight()'
                },
                {
                    label: 'draw',
                    detail: 'draw(cr)',
                    docs: 'DOC?',
                    insert: 'draw($1)'
                },
                {
                    label: 'ensure_style',
                    detail: 'ensure_style()',
                    docs: 'DOC?',
                    insert: 'ensure_style()'
                },
                {
                    label: 'error_bell',
                    detail: 'error_bell()',
                    docs: 'DOC?',
                    insert: 'error_bell()'
                },
                {
                    label: 'event',
                    detail: 'event(event)',
                    docs: 'DOC?',
                    insert: 'event($1)'
                },
                {
                    label: 'freeze_child_notify',
                    detail: 'freeze_child_notify()',
                    docs: 'DOC?',
                    insert: 'freeze_child_notify()'
                },
                {
                    label: 'get_accessible',
                    detail: 'get_accessible()',
                    docs: 'DOC?',
                    insert: 'get_accessible()'
                },
                {
                    label: 'get_action_group',
                    detail: 'get_action_group(prefix)',
                    docs: 'DOC?',
                    insert: 'get_action_group($1)'
                },
                {
                    label: 'get_allocated_baseline',
                    detail: 'get_allocated_baseline()',
                    docs: 'DOC?',
                    insert: 'get_allocated_baseline()'
                },
                {
                    label: 'get_allocated_height',
                    detail: 'get_allocated_height()',
                    docs: 'DOC?',
                    insert: 'get_allocated_height()'
                },
                {
                    label: 'get_allocated_size',
                    detail: 'get_allocated_size()',
                    docs: 'DOC?',
                    insert: 'get_allocated_size()'
                },
                {
                    label: 'get_allocated_width',
                    detail: 'get_allocated_width()',
                    docs: 'DOC?',
                    insert: 'get_allocated_width()'
                },
                {
                    label: 'get_allocation',
                    detail: 'get_allocation()',
                    docs: 'DOC?',
                    insert: 'get_allocation()'
                },
                {
                    label: 'get_ancestor',
                    detail: 'get_ancestor(widget_type)',
                    docs: 'DOC?',
                    insert: 'get_ancestor($1)'
                },
                {
                    label: 'get_app_paintable',
                    detail: 'get_app_paintable()',
                    docs: 'DOC?',
                    insert: 'get_app_paintable()'
                },
                {
                    label: 'get_can_default',
                    detail: 'get_can_default()',
                    docs: 'DOC?',
                    insert: 'get_can_default()'
                },
                {
                    label: 'get_can_focus',
                    detail: 'get_can_focus()',
                    docs: 'DOC?',
                    insert: 'get_can_focus()'
                },
                {
                    label: 'get_child_requisition',
                    detail: 'get_child_requisition()',
                    docs: 'DOC?',
                    insert: 'get_child_requisition()'
                },
                {
                    label: 'get_child_visible',
                    detail: 'get_child_visible()',
                    docs: 'DOC?',
                    insert: 'get_child_visible()'
                },
                {
                    label: 'get_clip',
                    detail: 'get_clip()',
                    docs: 'DOC?',
                    insert: 'get_clip()'
                },
                {
                    label: 'get_clipboard',
                    detail: 'get_clipboard(selection)',
                    docs: 'DOC?',
                    insert: 'get_clipboard($1)'
                },
                {
                    label: 'get_composite_name',
                    detail: 'get_composite_name()',
                    docs: 'DOC?',
                    insert: 'get_composite_name()'
                },
                {
                    label: 'get_device_enabled',
                    detail: 'get_device_enabled(device)',
                    docs: 'DOC?',
                    insert: 'get_device_enabled($1)'
                },
                {
                    label: 'get_device_events',
                    detail: 'get_device_events(device)',
                    docs: 'DOC?',
                    insert: 'get_device_events($1)'
                },
                {
                    label: 'get_direction',
                    detail: 'get_direction()',
                    docs: 'DOC?',
                    insert: 'get_direction()'
                },
                {
                    label: 'get_display',
                    detail: 'get_display()',
                    docs: 'DOC?',
                    insert: 'get_display()'
                },
                {
                    label: 'get_double_buffered',
                    detail: 'get_double_buffered()',
                    docs: 'DOC?',
                    insert: 'get_double_buffered()'
                },
                {
                    label: 'get_events',
                    detail: 'get_events()',
                    docs: 'DOC?',
                    insert: 'get_events()'
                },
                {
                    label: 'get_focus_on_click',
                    detail: 'get_focus_on_click()',
                    docs: 'DOC?',
                    insert: 'get_focus_on_click()'
                },
                {
                    label: 'get_font_map',
                    detail: 'get_font_map()',
                    docs: 'DOC?',
                    insert: 'get_font_map()'
                },
                {
                    label: 'get_font_options',
                    detail: 'get_font_options()',
                    docs: 'DOC?',
                    insert: 'get_font_options()'
                },
                {
                    label: 'get_frame_clock',
                    detail: 'get_frame_clock()',
                    docs: 'DOC?',
                    insert: 'get_frame_clock()'
                },
                {
                    label: 'get_halign',
                    detail: 'get_halign()',
                    docs: 'DOC?',
                    insert: 'get_halign()'
                },
                {
                    label: 'get_has_tooltip',
                    detail: 'get_has_tooltip()',
                    docs: 'DOC?',
                    insert: 'get_has_tooltip()'
                },
                {
                    label: 'get_has_window',
                    detail: 'get_has_window()',
                    docs: 'DOC?',
                    insert: 'get_has_window()'
                },
                {
                    label: 'get_hexpand',
                    detail: 'get_hexpand()',
                    docs: 'DOC?',
                    insert: 'get_hexpand()'
                },
                {
                    label: 'get_hexpand_set',
                    detail: 'get_hexpand_set()',
                    docs: 'DOC?',
                    insert: 'get_hexpand_set()'
                },
                {
                    label: 'get_mapped',
                    detail: 'get_mapped()',
                    docs: 'DOC?',
                    insert: 'get_mapped()'
                },
                {
                    label: 'get_margin_bottom',
                    detail: 'get_margin_bottom()',
                    docs: 'DOC?',
                    insert: 'get_margin_bottom()'
                },
                {
                    label: 'get_margin_end',
                    detail: 'get_margin_end()',
                    docs: 'DOC?',
                    insert: 'get_margin_end()'
                },
                {
                    label: 'get_margin_left',
                    detail: 'get_margin_left()',
                    docs: 'DOC?',
                    insert: 'get_margin_left()'
                },
                {
                    label: 'get_margin_right',
                    detail: 'get_margin_right()',
                    docs: 'DOC?',
                    insert: 'get_margin_right()'
                },
                {
                    label: 'get_margin_start',
                    detail: 'get_margin_start()',
                    docs: 'DOC?',
                    insert: 'get_margin_start()'
                },
                {
                    label: 'get_margin_top',
                    detail: 'get_margin_top()',
                    docs: 'DOC?',
                    insert: 'get_margin_top()'
                },
                {
                    label: 'get_modifier_mask',
                    detail: 'get_modifier_mask(intent)',
                    docs: 'DOC?',
                    insert: 'get_modifier_mask($1)'
                },
                {
                    label: 'get_modifier_style',
                    detail: 'get_modifier_style()',
                    docs: 'DOC?',
                    insert: 'get_modifier_style()'
                },
                {
                    label: 'get_name',
                    detail: 'get_name()',
                    docs: 'DOC?',
                    insert: 'get_name()'
                },
                {
                    label: 'get_no_show_all',
                    detail: 'get_no_show_all()',
                    docs: 'DOC?',
                    insert: 'get_no_show_all()'
                },
                {
                    label: 'get_opacity',
                    detail: 'get_opacity()',
                    docs: 'DOC?',
                    insert: 'get_opacity()'
                },
                {
                    label: 'get_pango_context',
                    detail: 'get_pango_context()',
                    docs: 'DOC?',
                    insert: 'get_pango_context()'
                },
                {
                    label: 'get_parent',
                    detail: 'get_parent()',
                    docs: 'DOC?',
                    insert: 'get_parent()'
                },
                {
                    label: 'get_parent_window',
                    detail: 'get_parent_window()',
                    docs: 'DOC?',
                    insert: 'get_parent_window()'
                },
                {
                    label: 'get_path',
                    detail: 'get_path()',
                    docs: 'DOC?',
                    insert: 'get_path()'
                },
                {
                    label: 'get_pointer',
                    detail: 'get_pointer()',
                    docs: 'DOC?',
                    insert: 'get_pointer()'
                },
                {
                    label: 'get_preferred_height',
                    detail: 'get_preferred_height()',
                    docs: 'DOC?',
                    insert: 'get_preferred_height()'
                },
                {
                    label: 'get_preferred_height_and_baseline_for_width',
                    detail: 'get_preferred_height_and_baseline_for_width(width)',
                    docs: 'DOC?',
                    insert: 'get_preferred_height_and_baseline_for_width($1)'
                },
                {
                    label: 'get_preferred_height_for_width',
                    detail: 'get_preferred_height_for_width(width)',
                    docs: 'DOC?',
                    insert: 'get_preferred_height_for_width($1)'
                },
                {
                    label: 'get_preferred_size',
                    detail: 'get_preferred_size()',
                    docs: 'DOC?',
                    insert: 'get_preferred_size()'
                },
                {
                    label: 'get_preferred_width',
                    detail: 'get_preferred_width()',
                    docs: 'DOC?',
                    insert: 'get_preferred_width()'
                },
                {
                    label: 'get_preferred_width_for_height',
                    detail: 'get_preferred_width_for_height(height)',
                    docs: 'DOC?',
                    insert: 'get_preferred_width_for_height($1)'
                },
                {
                    label: 'get_realized',
                    detail: 'get_realized()',
                    docs: 'DOC?',
                    insert: 'get_realized()'
                },
                {
                    label: 'get_receives_default',
                    detail: 'get_receives_default()',
                    docs: 'DOC?',
                    insert: 'get_receives_default()'
                },
                {
                    label: 'get_request_mode',
                    detail: 'get_request_mode()',
                    docs: 'DOC?',
                    insert: 'get_request_mode()'
                },
                {
                    label: 'get_requisition',
                    detail: 'get_requisition()',
                    docs: 'DOC?',
                    insert: 'get_requisition()'
                },
                {
                    label: 'get_root_window',
                    detail: 'get_root_window()',
                    docs: 'DOC?',
                    insert: 'get_root_window()'
                },
                {
                    label: 'get_scale_factor',
                    detail: 'get_scale_factor()',
                    docs: 'DOC?',
                    insert: 'get_scale_factor()'
                },
                {
                    label: 'get_screen',
                    detail: 'get_screen()',
                    docs: 'DOC?',
                    insert: 'get_screen()'
                },
                {
                    label: 'get_sensitive',
                    detail: 'get_sensitive()',
                    docs: 'DOC?',
                    insert: 'get_sensitive()'
                },
                {
                    label: 'get_settings',
                    detail: 'get_settings()',
                    docs: 'DOC?',
                    insert: 'get_settings()'
                },
                {
                    label: 'get_size_request',
                    detail: 'get_size_request()',
                    docs: 'DOC?',
                    insert: 'get_size_request()'
                },
                {
                    label: 'get_state',
                    detail: 'get_state()',
                    docs: 'DOC?',
                    insert: 'get_state()'
                },
                {
                    label: 'get_state_flags',
                    detail: 'get_state_flags()',
                    docs: 'DOC?',
                    insert: 'get_state_flags()'
                },
                {
                    label: 'get_style',
                    detail: 'get_style()',
                    docs: 'DOC?',
                    insert: 'get_style()'
                },
                {
                    label: 'get_style_context',
                    detail: 'get_style_context()',
                    docs: 'DOC?',
                    insert: 'get_style_context()'
                },
                {
                    label: 'get_support_multidevice',
                    detail: 'get_support_multidevice()',
                    docs: 'DOC?',
                    insert: 'get_support_multidevice()'
                },
                {
                    label: 'get_template_child',
                    detail: 'get_template_child(widget_type, name)',
                    docs: 'DOC?',
                    insert: 'get_template_child($1)'
                },
                {
                    label: 'get_tooltip_markup',
                    detail: 'get_tooltip_markup()',
                    docs: 'DOC?',
                    insert: 'get_tooltip_markup()'
                },
                {
                    label: 'get_tooltip_text',
                    detail: 'get_tooltip_text()',
                    docs: 'DOC?',
                    insert: 'get_tooltip_text()'
                },
                {
                    label: 'get_tooltip_window',
                    detail: 'get_tooltip_window()',
                    docs: 'DOC?',
                    insert: 'get_tooltip_window()'
                },
                {
                    label: 'get_toplevel',
                    detail: 'get_toplevel()',
                    docs: 'DOC?',
                    insert: 'get_toplevel()'
                },
                {
                    label: 'get_valign',
                    detail: 'get_valign()',
                    docs: 'DOC?',
                    insert: 'get_valign()'
                },
                {
                    label: 'get_valign_with_baseline',
                    detail: 'get_valign_with_baseline()',
                    docs: 'DOC?',
                    insert: 'get_valign_with_baseline()'
                },
                {
                    label: 'get_vexpand',
                    detail: 'get_vexpand()',
                    docs: 'DOC?',
                    insert: 'get_vexpand()'
                },
                {
                    label: 'get_vexpand_set',
                    detail: 'get_vexpand_set()',
                    docs: 'DOC?',
                    insert: 'get_vexpand_set()'
                },
                {
                    label: 'get_visible',
                    detail: 'get_visible()',
                    docs: 'DOC?',
                    insert: 'get_visible()'
                },
                {
                    label: 'get_visual',
                    detail: 'get_visual()',
                    docs: 'DOC?',
                    insert: 'get_visual()'
                },
                {
                    label: 'get_window',
                    detail: 'get_window()',
                    docs: 'DOC?',
                    insert: 'get_window()'
                },
                {
                    label: 'grab_add',
                    detail: 'grab_add()',
                    docs: 'DOC?',
                    insert: 'grab_add()'
                },
                {
                    label: 'grab_default',
                    detail: 'grab_default()',
                    docs: 'DOC?',
                    insert: 'grab_default()'
                },
                {
                    label: 'grab_focus',
                    detail: 'grab_focus()',
                    docs: 'DOC?',
                    insert: 'grab_focus()'
                },
                {
                    label: 'grab_remove',
                    detail: 'grab_remove()',
                    docs: 'DOC?',
                    insert: 'grab_remove()'
                },
                {
                    label: 'has_default',
                    detail: 'has_default()',
                    docs: 'DOC?',
                    insert: 'has_default()'
                },
                {
                    label: 'has_focus',
                    detail: 'has_focus()',
                    docs: 'DOC?',
                    insert: 'has_focus()'
                },
                {
                    label: 'has_grab',
                    detail: 'has_grab()',
                    docs: 'DOC?',
                    insert: 'has_grab()'
                },
                {
                    label: 'has_rc_style',
                    detail: 'has_rc_style()',
                    docs: 'DOC?',
                    insert: 'has_rc_style()'
                },
                {
                    label: 'has_screen',
                    detail: 'has_screen()',
                    docs: 'DOC?',
                    insert: 'has_screen()'
                },
                {
                    label: 'has_visible_focus',
                    detail: 'has_visible_focus()',
                    docs: 'DOC?',
                    insert: 'has_visible_focus()'
                },
                {
                    label: 'hide',
                    detail: 'hide()',
                    docs: 'DOC?',
                    insert: 'hide()'
                },
                {
                    label: 'hide_on_delete',
                    detail: 'hide_on_delete()',
                    docs: 'DOC?',
                    insert: 'hide_on_delete()'
                },
                {
                    label: 'in_destruction',
                    detail: 'in_destruction()',
                    docs: 'DOC?',
                    insert: 'in_destruction()'
                },
                {
                    label: 'init_template',
                    detail: 'init_template()',
                    docs: 'DOC?',
                    insert: 'init_template()'
                },
                {
                    label: 'input_shape_combine_region',
                    detail: 'input_shape_combine_region(region)',
                    docs: 'DOC?',
                    insert: 'input_shape_combine_region($1)'
                },
                {
                    label: 'insert_action_group',
                    detail: 'insert_action_group(name, group)',
                    docs: 'DOC?',
                    insert: 'insert_action_group($1)'
                },
                {
                    label: 'intersect',
                    detail: 'intersect(area)',
                    docs: 'DOC?',
                    insert: 'intersect($1)'
                },
                {
                    label: 'is_ancestor',
                    detail: 'is_ancestor(ancestor)',
                    docs: 'DOC?',
                    insert: 'is_ancestor($1)'
                },
                {
                    label: 'is_composited',
                    detail: 'is_composited()',
                    docs: 'DOC?',
                    insert: 'is_composited()'
                },
                {
                    label: 'is_drawable',
                    detail: 'is_drawable()',
                    docs: 'DOC?',
                    insert: 'is_drawable()'
                },
                {
                    label: 'is_focus',
                    detail: 'is_focus()',
                    docs: 'DOC?',
                    insert: 'is_focus()'
                },
                {
                    label: 'is_sensitive',
                    detail: 'is_sensitive()',
                    docs: 'DOC?',
                    insert: 'is_sensitive()'
                },
                {
                    label: 'is_toplevel',
                    detail: 'is_toplevel()',
                    docs: 'DOC?',
                    insert: 'is_toplevel()'
                },
                {
                    label: 'is_visible',
                    detail: 'is_visible()',
                    docs: 'DOC?',
                    insert: 'is_visible()'
                },
                {
                    label: 'keynav_failed',
                    detail: 'keynav_failed(direction)',
                    docs: 'DOC?',
                    insert: 'keynav_failed($1)'
                },
                {
                    label: 'list_accel_closures',
                    detail: 'list_accel_closures()',
                    docs: 'DOC?',
                    insert: 'list_accel_closures()'
                },
                {
                    label: 'list_action_prefixes',
                    detail: 'list_action_prefixes()',
                    docs: 'DOC?',
                    insert: 'list_action_prefixes()'
                },
                {
                    label: 'list_mnemonic_labels',
                    detail: 'list_mnemonic_labels()',
                    docs: 'DOC?',
                    insert: 'list_mnemonic_labels()'
                },
                {
                    label: 'map',
                    detail: 'map()',
                    docs: 'DOC?',
                    insert: 'map()'
                },
                {
                    label: 'mnemonic_activate',
                    detail: 'mnemonic_activate(group_cycling)',
                    docs: 'DOC?',
                    insert: 'mnemonic_activate($1)'
                },
                {
                    label: 'modify_base',
                    detail: 'modify_base(state, color)',
                    docs: 'DOC?',
                    insert: 'modify_base($1)'
                },
                {
                    label: 'modify_bg',
                    detail: 'modify_bg(state, color)',
                    docs: 'DOC?',
                    insert: 'modify_bg($1)'
                },
                {
                    label: 'modify_cursor',
                    detail: 'modify_cursor(primary, secondary)',
                    docs: 'DOC?',
                    insert: 'modify_cursor($1)'
                },
                {
                    label: 'modify_fg',
                    detail: 'modify_fg(state, color)',
                    docs: 'DOC?',
                    insert: 'modify_fg($1)'
                },
                {
                    label: 'modify_font',
                    detail: 'modify_font(font_desc)',
                    docs: 'DOC?',
                    insert: 'modify_font($1)'
                },
                {
                    label: 'modify_style',
                    detail: 'modify_style(style)',
                    docs: 'DOC?',
                    insert: 'modify_style($1)'
                },
                {
                    label: 'modify_text',
                    detail: 'modify_text(state, color)',
                    docs: 'DOC?',
                    insert: 'modify_text($1)'
                },
                {
                    label: 'override_background_color',
                    detail: 'override_background_color(state, color)',
                    docs: 'DOC?',
                    insert: 'override_background_color($1)'
                },
                {
                    label: 'override_color',
                    detail: 'override_color(state, color)',
                    docs: 'DOC?',
                    insert: 'override_color($1)'
                },
                {
                    label: 'override_cursor',
                    detail: 'override_cursor(cursor, secondary_cursor)',
                    docs: 'DOC?',
                    insert: 'override_cursor($1)'
                },
                {
                    label: 'override_font',
                    detail: 'override_font(font_desc)',
                    docs: 'DOC?',
                    insert: 'override_font($1)'
                },
                {
                    label: 'override_symbolic_color',
                    detail: 'override_symbolic_color(name, color)',
                    docs: 'DOC?',
                    insert: 'override_symbolic_color($1)'
                },
                {
                    label: 'path',
                    detail: 'path()',
                    docs: 'DOC?',
                    insert: 'path()'
                },
                {
                    label: 'queue_allocate',
                    detail: 'queue_allocate()',
                    docs: 'DOC?',
                    insert: 'queue_allocate()'
                },
                {
                    label: 'queue_compute_expand',
                    detail: 'queue_compute_expand()',
                    docs: 'DOC?',
                    insert: 'queue_compute_expand()'
                },
                {
                    label: 'queue_draw',
                    detail: 'queue_draw()',
                    docs: 'DOC?',
                    insert: 'queue_draw()'
                },
                {
                    label: 'queue_draw_area',
                    detail: 'queue_draw_area(x, y, width, height)',
                    docs: 'DOC?',
                    insert: 'queue_draw_area($1)'
                },
                {
                    label: 'queue_draw_region',
                    detail: 'queue_draw_region(region)',
                    docs: 'DOC?',
                    insert: 'queue_draw_region($1)'
                },
                {
                    label: 'queue_resize',
                    detail: 'queue_resize()',
                    docs: 'DOC?',
                    insert: 'queue_resize()'
                },
                {
                    label: 'queue_resize_no_redraw',
                    detail: 'queue_resize_no_redraw()',
                    docs: 'DOC?',
                    insert: 'queue_resize_no_redraw()'
                },
                {
                    label: 'realize',
                    detail: 'realize()',
                    docs: 'DOC?',
                    insert: 'realize()'
                },
                {
                    label: 'region_intersect',
                    detail: 'region_intersect(region)',
                    docs: 'DOC?',
                    insert: 'region_intersect($1)'
                },
                {
                    label: 'register_window',
                    detail: 'register_window(window)',
                    docs: 'DOC?',
                    insert: 'register_window($1)'
                },
                {
                    label: 'remove_accelerator',
                    detail: 'remove_accelerator(accel_group, accel_key, accel_mods)',
                    docs: 'DOC?',
                    insert: 'remove_accelerator($1)'
                },
                {
                    label: 'remove_mnemonic_label',
                    detail: 'remove_mnemonic_label(label)',
                    docs: 'DOC?',
                    insert: 'remove_mnemonic_label($1)'
                },
                {
                    label: 'remove_tick_callback',
                    detail: 'remove_tick_callback(id)',
                    docs: 'DOC?',
                    insert: 'remove_tick_callback($1)'
                },
                {
                    label: 'render_icon',
                    detail: 'render_icon(stock_id, size, detail)',
                    docs: 'DOC?',
                    insert: 'render_icon($1)'
                },
                {
                    label: 'render_icon_pixbuf',
                    detail: 'render_icon_pixbuf(stock_id, size)',
                    docs: 'DOC?',
                    insert: 'render_icon_pixbuf($1)'
                },
                {
                    label: 'reparent',
                    detail: 'reparent(new_parent)',
                    docs: 'DOC?',
                    insert: 'reparent($1)'
                },
                {
                    label: 'reset_rc_styles',
                    detail: 'reset_rc_styles()',
                    docs: 'DOC?',
                    insert: 'reset_rc_styles()'
                },
                {
                    label: 'reset_style',
                    detail: 'reset_style()',
                    docs: 'DOC?',
                    insert: 'reset_style()'
                },
                {
                    label: 'send_expose',
                    detail: 'send_expose(event)',
                    docs: 'DOC?',
                    insert: 'send_expose($1)'
                },
                {
                    label: 'send_focus_change',
                    detail: 'send_focus_change(event)',
                    docs: 'DOC?',
                    insert: 'send_focus_change($1)'
                },
                {
                    label: 'set_accel_path',
                    detail: 'set_accel_path(accel_path, accel_group)',
                    docs: 'DOC?',
                    insert: 'set_accel_path($1)'
                },
                {
                    label: 'set_allocation',
                    detail: 'set_allocation(allocation)',
                    docs: 'DOC?',
                    insert: 'set_allocation($1)'
                },
                {
                    label: 'set_app_paintable',
                    detail: 'set_app_paintable(app_paintable)',
                    docs: 'DOC?',
                    insert: 'set_app_paintable($1)'
                },
                {
                    label: 'set_can_default',
                    detail: 'set_can_default(can_default)',
                    docs: 'DOC?',
                    insert: 'set_can_default($1)'
                },
                {
                    label: 'set_can_focus',
                    detail: 'set_can_focus(can_focus)',
                    docs: 'DOC?',
                    insert: 'set_can_focus($1)'
                },
                {
                    label: 'set_child_visible',
                    detail: 'set_child_visible(is_visible)',
                    docs: 'DOC?',
                    insert: 'set_child_visible($1)'
                },
                {
                    label: 'set_clip',
                    detail: 'set_clip(clip)',
                    docs: 'DOC?',
                    insert: 'set_clip($1)'
                },
                {
                    label: 'set_composite_name',
                    detail: 'set_composite_name(name)',
                    docs: 'DOC?',
                    insert: 'set_composite_name($1)'
                },
                {
                    label: 'set_device_enabled',
                    detail: 'set_device_enabled(device, enabled)',
                    docs: 'DOC?',
                    insert: 'set_device_enabled($1)'
                },
                {
                    label: 'set_device_events',
                    detail: 'set_device_events(device, events)',
                    docs: 'DOC?',
                    insert: 'set_device_events($1)'
                },
                {
                    label: 'set_direction',
                    detail: 'set_direction(dir)',
                    docs: 'DOC?',
                    insert: 'set_direction($1)'
                },
                {
                    label: 'set_double_buffered',
                    detail: 'set_double_buffered(double_buffered)',
                    docs: 'DOC?',
                    insert: 'set_double_buffered($1)'
                },
                {
                    label: 'set_events',
                    detail: 'set_events(events)',
                    docs: 'DOC?',
                    insert: 'set_events($1)'
                },
                {
                    label: 'set_focus_on_click',
                    detail: 'set_focus_on_click(focus_on_click)',
                    docs: 'DOC?',
                    insert: 'set_focus_on_click($1)'
                },
                {
                    label: 'set_font_map',
                    detail: 'set_font_map(font_map)',
                    docs: 'DOC?',
                    insert: 'set_font_map($1)'
                },
                {
                    label: 'set_font_options',
                    detail: 'set_font_options(options)',
                    docs: 'DOC?',
                    insert: 'set_font_options($1)'
                },
                {
                    label: 'set_halign',
                    detail: 'set_halign(align)',
                    docs: 'DOC?',
                    insert: 'set_halign($1)'
                },
                {
                    label: 'set_has_tooltip',
                    detail: 'set_has_tooltip(has_tooltip)',
                    docs: 'DOC?',
                    insert: 'set_has_tooltip($1)'
                },
                {
                    label: 'set_has_window',
                    detail: 'set_has_window(has_window)',
                    docs: 'DOC?',
                    insert: 'set_has_window($1)'
                },
                {
                    label: 'set_hexpand',
                    detail: 'set_hexpand(expand)',
                    docs: 'DOC?',
                    insert: 'set_hexpand($1)'
                },
                {
                    label: 'set_hexpand_set',
                    detail: 'set_hexpand_set(set)',
                    docs: 'DOC?',
                    insert: 'set_hexpand_set($1)'
                },
                {
                    label: 'set_mapped',
                    detail: 'set_mapped(mapped)',
                    docs: 'DOC?',
                    insert: 'set_mapped($1)'
                },
                {
                    label: 'set_margin_bottom',
                    detail: 'set_margin_bottom(margin)',
                    docs: 'DOC?',
                    insert: 'set_margin_bottom($1)'
                },
                {
                    label: 'set_margin_end',
                    detail: 'set_margin_end(margin)',
                    docs: 'DOC?',
                    insert: 'set_margin_end($1)'
                },
                {
                    label: 'set_margin_left',
                    detail: 'set_margin_left(margin)',
                    docs: 'DOC?',
                    insert: 'set_margin_left($1)'
                },
                {
                    label: 'set_margin_right',
                    detail: 'set_margin_right(margin)',
                    docs: 'DOC?',
                    insert: 'set_margin_right($1)'
                },
                {
                    label: 'set_margin_start',
                    detail: 'set_margin_start(margin)',
                    docs: 'DOC?',
                    insert: 'set_margin_start($1)'
                },
                {
                    label: 'set_margin_top',
                    detail: 'set_margin_top(margin)',
                    docs: 'DOC?',
                    insert: 'set_margin_top($1)'
                },
                {
                    label: 'set_name',
                    detail: 'set_name(name)',
                    docs: 'DOC?',
                    insert: 'set_name($1)'
                },
                {
                    label: 'set_no_show_all',
                    detail: 'set_no_show_all(no_show_all)',
                    docs: 'DOC?',
                    insert: 'set_no_show_all($1)'
                },
                {
                    label: 'set_opacity',
                    detail: 'set_opacity(opacity)',
                    docs: 'DOC?',
                    insert: 'set_opacity($1)'
                },
                {
                    label: 'set_parent',
                    detail: 'set_parent(parent)',
                    docs: 'DOC?',
                    insert: 'set_parent($1)'
                },
                {
                    label: 'set_parent_window',
                    detail: 'set_parent_window(parent_window)',
                    docs: 'DOC?',
                    insert: 'set_parent_window($1)'
                },
                {
                    label: 'set_realized',
                    detail: 'set_realized(realized)',
                    docs: 'DOC?',
                    insert: 'set_realized($1)'
                },
                {
                    label: 'set_receives_default',
                    detail: 'set_receives_default(receives_default)',
                    docs: 'DOC?',
                    insert: 'set_receives_default($1)'
                },
                {
                    label: 'set_redraw_on_allocate',
                    detail: 'set_redraw_on_allocate(redraw_on_allocate)',
                    docs: 'DOC?',
                    insert: 'set_redraw_on_allocate($1)'
                },
                {
                    label: 'set_sensitive',
                    detail: 'set_sensitive(sensitive)',
                    docs: 'DOC?',
                    insert: 'set_sensitive($1)'
                },
                {
                    label: 'set_size_request',
                    detail: 'set_size_request(width, height)',
                    docs: 'DOC?',
                    insert: 'set_size_request($1)'
                },
                {
                    label: 'set_state',
                    detail: 'set_state(state)',
                    docs: 'DOC?',
                    insert: 'set_state($1)'
                },
                {
                    label: 'set_state_flags',
                    detail: 'set_state_flags(flags, clear)',
                    docs: 'DOC?',
                    insert: 'set_state_flags($1)'
                },
                {
                    label: 'set_style',
                    detail: 'set_style(style)',
                    docs: 'DOC?',
                    insert: 'set_style($1)'
                },
                {
                    label: 'set_support_multidevice',
                    detail: 'set_support_multidevice(support_multidevice)',
                    docs: 'DOC?',
                    insert: 'set_support_multidevice($1)'
                },
                {
                    label: 'set_tooltip_markup',
                    detail: 'set_tooltip_markup(markup)',
                    docs: 'DOC?',
                    insert: 'set_tooltip_markup($1)'
                },
                {
                    label: 'set_tooltip_text',
                    detail: 'set_tooltip_text(text)',
                    docs: 'DOC?',
                    insert: 'set_tooltip_text($1)'
                },
                {
                    label: 'set_tooltip_window',
                    detail: 'set_tooltip_window(custom_window)',
                    docs: 'DOC?',
                    insert: 'set_tooltip_window($1)'
                },
                {
                    label: 'set_valign',
                    detail: 'set_valign(align)',
                    docs: 'DOC?',
                    insert: 'set_valign($1)'
                },
                {
                    label: 'set_vexpand',
                    detail: 'set_vexpand(expand)',
                    docs: 'DOC?',
                    insert: 'set_vexpand($1)'
                },
                {
                    label: 'set_vexpand_set',
                    detail: 'set_vexpand_set(set)',
                    docs: 'DOC?',
                    insert: 'set_vexpand_set($1)'
                },
                {
                    label: 'set_visible',
                    detail: 'set_visible(visible)',
                    docs: 'DOC?',
                    insert: 'set_visible($1)'
                },
                {
                    label: 'set_visual',
                    detail: 'set_visual(visual)',
                    docs: 'DOC?',
                    insert: 'set_visual($1)'
                },
                {
                    label: 'set_window',
                    detail: 'set_window(window)',
                    docs: 'DOC?',
                    insert: 'set_window($1)'
                },
                {
                    label: 'shape_combine_region',
                    detail: 'shape_combine_region(region)',
                    docs: 'DOC?',
                    insert: 'shape_combine_region($1)'
                },
                {
                    label: 'show',
                    detail: 'show()',
                    docs: 'DOC?',
                    insert: 'show()'
                },
                {
                    label: 'show_all',
                    detail: 'show_all()',
                    docs: 'DOC?',
                    insert: 'show_all()'
                },
                {
                    label: 'show_now',
                    detail: 'show_now()',
                    docs: 'DOC?',
                    insert: 'show_now()'
                },
                {
                    label: 'size_allocate',
                    detail: 'size_allocate(allocation)',
                    docs: 'DOC?',
                    insert: 'size_allocate($1)'
                },
                {
                    label: 'size_allocate_with_baseline',
                    detail: 'size_allocate_with_baseline(allocation, baseline)',
                    docs: 'DOC?',
                    insert: 'size_allocate_with_baseline($1)'
                },
                {
                    label: 'size_request',
                    detail: 'size_request()',
                    docs: 'DOC?',
                    insert: 'size_request()'
                },
                {
                    label: 'style_attach',
                    detail: 'style_attach()',
                    docs: 'DOC?',
                    insert: 'style_attach()'
                },
                {
                    label: 'style_get_property',
                    detail: 'style_get_property(property_name, value=None)',
                    docs: 'DOC?',
                    insert: 'style_get_property($1)'
                },
                {
                    label: 'thaw_child_notify',
                    detail: 'thaw_child_notify()',
                    docs: 'DOC?',
                    insert: 'thaw_child_notify()'
                },
                {
                    label: 'translate_coordinates',
                    detail: 'translate_coordinates(dest_widget, src_x, src_y)',
                    docs: 'DOC?',
                    insert: 'translate_coordinates($1)'
                },
                {
                    label: 'trigger_tooltip_query',
                    detail: 'trigger_tooltip_query()',
                    docs: 'DOC?',
                    insert: 'trigger_tooltip_query()'
                },
                {
                    label: 'unmap',
                    detail: 'unmap()',
                    docs: 'DOC?',
                    insert: 'unmap()'
                },
                {
                    label: 'unparent',
                    detail: 'unparent()',
                    docs: 'DOC?',
                    insert: 'unparent()'
                },
                {
                    label: 'unrealize',
                    detail: 'unrealize()',
                    docs: 'DOC?',
                    insert: 'unrealize()'
                },
                {
                    label: 'unregister_window',
                    detail: 'unregister_window(window)',
                    docs: 'DOC?',
                    insert: 'unregister_window($1)'
                },
                {
                    label: 'unset_state_flags',
                    detail: 'unset_state_flags(flags)',
                    docs: 'DOC?',
                    insert: 'unset_state_flags($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkMisk = [
                {
                    label: 'get_alignment',
                    detail: 'get_alignment()',
                    docs: 'DOC?',
                    insert: 'get_alignment()'
                },
                {
                    label: 'get_padding',
                    detail: 'get_padding()',
                    docs: 'DOC?',
                    insert: 'get_padding()'
                },
                {
                    label: 'set_alignment',
                    detail: 'set_alignment(xalign, yalign)',
                    docs: 'DOC?',
                    insert: 'set_alignment($1)'
                },
                {
                    label: 'set_padding',
                    detail: 'set_padding(xpad, ypad)',
                    docs: 'DOC?',
                    insert: 'set_padding($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkContainer = [
                {
                    label: 'find_child_property',
                    detail: 'find_child_property(property_name)',
                    docs: 'DOC?',
                    insert: 'find_child_property($1)'
                },
                {
                    label: 'handle_border_width',
                    detail: 'handle_border_width()',
                    docs: 'DOC?',
                    insert: 'handle_border_width()'
                },
                {
                    label: 'install_child_properties',
                    detail: 'install_child_properties(pspecs)',
                    docs: 'DOC?',
                    insert: 'install_child_properties($1)'
                },
                {
                    label: 'install_child_property',
                    detail: 'install_child_property(property_id, pspec)',
                    docs: 'DOC?',
                    insert: 'install_child_property($1)'
                },
                {
                    label: 'list_child_properties',
                    detail: 'list_child_properties()',
                    docs: 'DOC?',
                    insert: 'list_child_properties()'
                },
                {
                    label: 'add',
                    detail: 'add(widget)',
                    docs: 'DOC?',
                    insert: 'add($1)'
                },
                {
                    label: 'check_resize',
                    detail: 'check_resize()',
                    docs: 'DOC?',
                    insert: 'check_resize()'
                },
                {
                    label: 'child_get',
                    detail: 'child_get(child, *prop_names)',
                    docs: 'DOC?',
                    insert: 'child_get($1)'
                },
                {
                    label: 'child_get_property',
                    detail: 'child_get_property(child, property_name, value=None)',
                    docs: 'DOC?',
                    insert: 'child_get_property($1)'
                },
                {
                    label: 'child_notify',
                    detail: 'child_notify(child, child_property)',
                    docs: 'DOC?',
                    insert: 'child_notify($1)'
                },
                {
                    label: 'child_notify_by_pspec',
                    detail: 'child_notify_by_pspec(child, pspec)',
                    docs: 'DOC?',
                    insert: 'child_notify_by_pspec($1)'
                },
                {
                    label: 'child_set',
                    detail: 'child_set(child, **kwargs)',
                    docs: 'DOC?',
                    insert: 'child_set($1)'
                },
                {
                    label: 'child_set_property',
                    detail: 'child_set_property(child, property_name, value)',
                    docs: 'DOC?',
                    insert: 'child_set_property($1)'
                },
                {
                    label: 'child_type',
                    detail: 'child_type()',
                    docs: 'DOC?',
                    insert: 'child_type()'
                },
                {
                    label: 'forall',
                    detail: 'forall(callback, *callback_data)',
                    docs: 'DOC?',
                    insert: 'forall($1)'
                },
                {
                    label: 'foreach',
                    detail: 'foreach(callback, *callback_data)',
                    docs: 'DOC?',
                    insert: 'foreach($1)'
                },
                {
                    label: 'get_border_width',
                    detail: 'get_border_width()',
                    docs: 'DOC?',
                    insert: 'get_border_width()'
                },
                {
                    label: 'get_children',
                    detail: 'get_children()',
                    docs: 'DOC?',
                    insert: 'get_children()'
                },
                {
                    label: 'get_focus_chain',
                    detail: 'get_focus_chain()',
                    docs: 'DOC?',
                    insert: 'get_focus_chain()'
                },
                {
                    label: 'get_focus_child',
                    detail: 'get_focus_child()',
                    docs: 'DOC?',
                    insert: 'get_focus_child()'
                },
                {
                    label: 'get_focus_hadjustment',
                    detail: 'get_focus_hadjustment()',
                    docs: 'DOC?',
                    insert: 'get_focus_hadjustment()'
                },
                {
                    label: 'get_focus_vadjustment',
                    detail: 'get_focus_vadjustment()',
                    docs: 'DOC?',
                    insert: 'get_focus_vadjustment()'
                },
                {
                    label: 'get_path_for_child',
                    detail: 'get_path_for_child(child)',
                    docs: 'DOC?',
                    insert: 'get_path_for_child($1)'
                },
                {
                    label: 'get_resize_mode',
                    detail: 'get_resize_mode()',
                    docs: 'DOC?',
                    insert: 'get_resize_mode()'
                },
                {
                    label: 'propagate_draw',
                    detail: 'propagate_draw(child, cr)',
                    docs: 'DOC?',
                    insert: 'propagate_draw($1)'
                },
                {
                    label: 'remove',
                    detail: 'remove(widget)',
                    docs: 'DOC?',
                    insert: 'remove($1)'
                },
                {
                    label: 'resize_children',
                    detail: 'resize_children()',
                    docs: 'DOC?',
                    insert: 'resize_children()'
                },
                {
                    label: 'set_border_width',
                    detail: 'set_border_width(border_width)',
                    docs: 'DOC?',
                    insert: 'set_border_width($1)'
                },
                {
                    label: 'set_focus_chain',
                    detail: 'set_focus_chain(focusable_widgets)',
                    docs: 'DOC?',
                    insert: 'set_focus_chain($1)'
                },
                {
                    label: 'set_focus_child',
                    detail: 'set_focus_child(child)',
                    docs: 'DOC?',
                    insert: 'set_focus_child($1)'
                },
                {
                    label: 'set_focus_hadjustment',
                    detail: 'set_focus_hadjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_focus_hadjustment($1)'
                },
                {
                    label: 'set_focus_vadjustment',
                    detail: 'set_focus_vadjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_focus_vadjustment($1)'
                },
                {
                    label: 'set_reallocate_redraws',
                    detail: 'set_reallocate_redraws(needs_redraws)',
                    docs: 'DOC?',
                    insert: 'set_reallocate_redraws($1)'
                },
                {
                    label: 'set_resize_mode',
                    detail: 'set_resize_mode(resize_mode)',
                    docs: 'DOC?',
                    insert: 'set_resize_mode($1)'
                },
                {
                    label: 'unset_focus_chain',
                    detail: 'unset_focus_chain()',
                    docs: 'DOC?',
                    insert: 'unset_focus_chain()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkBin = [
                {
                    label: 'get_child',
                    detail: 'get_child()',
                    docs: 'DOC?',
                    insert: 'get_child()'
                },
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkWindow = [
                {
                    label: 'get_default_icon_list',
                    detail: 'get_default_icon_list()',
                    docs: 'DOC?',
                    insert: 'get_default_icon_list()'
                },
                {
                    label: 'get_default_icon_name',
                    detail: 'get_default_icon_name()',
                    docs: 'DOC?',
                    insert: 'get_default_icon_name()'
                },
                {
                    label: 'list_toplevels',
                    detail: 'list_toplevels()',
                    docs: 'DOC?',
                    insert: 'list_toplevels()'
                },
                {
                    label: 'new',
                    detail: 'new(type)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'set_auto_startup_notification',
                    detail: 'set_auto_startup_notification(setting)',
                    docs: 'DOC?',
                    insert: 'set_auto_startup_notification($1)'
                },
                {
                    label: 'set_default_icon',
                    detail: 'set_default_icon(icon)',
                    docs: 'DOC?',
                    insert: 'set_default_icon($1)'
                },
                {
                    label: 'set_default_icon_from_file',
                    detail: 'set_default_icon_from_file(filename)',
                    docs: 'DOC?',
                    insert: 'set_default_icon_from_file($1)'
                },
                {
                    label: 'set_default_icon_list',
                    detail: 'set_default_icon_list(list)',
                    docs: 'DOC?',
                    insert: 'set_default_icon_list($1)'
                },
                {
                    label: 'set_default_icon_name',
                    detail: 'set_default_icon_name(name)',
                    docs: 'DOC?',
                    insert: 'set_default_icon_name($1)'
                },
                {
                    label: 'set_interactive_debugging',
                    detail: 'set_interactive_debugging(enable)',
                    docs: 'DOC?',
                    insert: 'set_interactive_debugging($1)'
                },
                {
                    label: 'activate_default',
                    detail: 'activate_default()',
                    docs: 'DOC?',
                    insert: 'activate_default()'
                },
                {
                    label: 'activate_focus',
                    detail: 'activate_focus()',
                    docs: 'DOC?',
                    insert: 'activate_focus()'
                },
                {
                    label: 'activate_key',
                    detail: 'activate_key(event)',
                    docs: 'DOC?',
                    insert: 'activate_key($1)'
                },
                {
                    label: 'add_accel_group',
                    detail: 'add_accel_group(accel_group)',
                    docs: 'DOC?',
                    insert: 'add_accel_group($1)'
                },
                {
                    label: 'add_mnemonic',
                    detail: 'add_mnemonic(keyval, target)',
                    docs: 'DOC?',
                    insert: 'add_mnemonic($1)'
                },
                {
                    label: 'begin_move_drag',
                    detail: 'begin_move_drag(button, root_x, root_y, timestamp)',
                    docs: 'DOC?',
                    insert: 'begin_move_drag($1)'
                },
                {
                    label: 'begin_resize_drag',
                    detail: 'begin_resize_drag(edge, button, root_x, root_y, timestamp)',
                    docs: 'DOC?',
                    insert: 'begin_resize_drag($1)'
                },
                {
                    label: 'close',
                    detail: 'close()',
                    docs: 'DOC?',
                    insert: 'close()'
                },
                {
                    label: 'deiconify',
                    detail: 'deiconify()',
                    docs: 'DOC?',
                    insert: 'deiconify()'
                },
                {
                    label: 'fullscreen',
                    detail: 'fullscreen()',
                    docs: 'DOC?',
                    insert: 'fullscreen()'
                },
                {
                    label: 'fullscreen_on_monitor',
                    detail: 'fullscreen_on_monitor(screen, monitor)',
                    docs: 'DOC?',
                    insert: 'fullscreen_on_monitor($1)'
                },
                {
                    label: 'get_accept_focus',
                    detail: 'get_accept_focus()',
                    docs: 'DOC?',
                    insert: 'get_accept_focus()'
                },
                {
                    label: 'get_application',
                    detail: 'get_application()',
                    docs: 'DOC?',
                    insert: 'get_application()'
                },
                {
                    label: 'get_attached_to',
                    detail: 'get_attached_to()',
                    docs: 'DOC?',
                    insert: 'get_attached_to()'
                },
                {
                    label: 'get_decorated',
                    detail: 'get_decorated()',
                    docs: 'DOC?',
                    insert: 'get_decorated()'
                },
                {
                    label: 'get_default_size',
                    detail: 'get_default_size()',
                    docs: 'DOC?',
                    insert: 'get_default_size()'
                },
                {
                    label: 'get_default_widget',
                    detail: 'get_default_widget()',
                    docs: 'DOC?',
                    insert: 'get_default_widget()'
                },
                {
                    label: 'get_deletable',
                    detail: 'get_deletable()',
                    docs: 'DOC?',
                    insert: 'get_deletable()'
                },
                {
                    label: 'get_destroy_with_parent',
                    detail: 'get_destroy_with_parent()',
                    docs: 'DOC?',
                    insert: 'get_destroy_with_parent()'
                },
                {
                    label: 'get_focus',
                    detail: 'get_focus()',
                    docs: 'DOC?',
                    insert: 'get_focus()'
                },
                {
                    label: 'get_focus_on_map',
                    detail: 'get_focus_on_map()',
                    docs: 'DOC?',
                    insert: 'get_focus_on_map()'
                },
                {
                    label: 'get_focus_visible',
                    detail: 'get_focus_visible()',
                    docs: 'DOC?',
                    insert: 'get_focus_visible()'
                },
                {
                    label: 'get_gravity',
                    detail: 'get_gravity()',
                    docs: 'DOC?',
                    insert: 'get_gravity()'
                },
                {
                    label: 'get_group',
                    detail: 'get_group()',
                    docs: 'DOC?',
                    insert: 'get_group()'
                },
                {
                    label: 'get_has_resize_grip',
                    detail: 'get_has_resize_grip()',
                    docs: 'DOC?',
                    insert: 'get_has_resize_grip()'
                },
                {
                    label: 'get_hide_titlebar_when_maximized',
                    detail: 'get_hide_titlebar_when_maximized()',
                    docs: 'DOC?',
                    insert: 'get_hide_titlebar_when_maximized()'
                },
                {
                    label: 'get_icon',
                    detail: 'get_icon()',
                    docs: 'DOC?',
                    insert: 'get_icon()'
                },
                {
                    label: 'get_icon_list',
                    detail: 'get_icon_list()',
                    docs: 'DOC?',
                    insert: 'get_icon_list()'
                },
                {
                    label: 'get_icon_name',
                    detail: 'get_icon_name()',
                    docs: 'DOC?',
                    insert: 'get_icon_name()'
                },
                {
                    label: 'get_mnemonic_modifier',
                    detail: 'get_mnemonic_modifier()',
                    docs: 'DOC?',
                    insert: 'get_mnemonic_modifier()'
                },
                {
                    label: 'get_mnemonics_visible',
                    detail: 'get_mnemonics_visible()',
                    docs: 'DOC?',
                    insert: 'get_mnemonics_visible()'
                },
                {
                    label: 'get_modal',
                    detail: 'get_modal()',
                    docs: 'DOC?',
                    insert: 'get_modal()'
                },
                {
                    label: 'get_opacity',
                    detail: 'get_opacity()',
                    docs: 'DOC?',
                    insert: 'get_opacity()'
                },
                {
                    label: 'get_position',
                    detail: 'get_position()',
                    docs: 'DOC?',
                    insert: 'get_position()'
                },
                {
                    label: 'get_resizable',
                    detail: 'get_resizable()',
                    docs: 'DOC?',
                    insert: 'get_resizable()'
                },
                {
                    label: 'get_resize_grip_area',
                    detail: 'get_resize_grip_area()',
                    docs: 'DOC?',
                    insert: 'get_resize_grip_area()'
                },
                {
                    label: 'get_role',
                    detail: 'get_role()',
                    docs: 'DOC?',
                    insert: 'get_role()'
                },
                {
                    label: 'get_screen',
                    detail: 'get_screen()',
                    docs: 'DOC?',
                    insert: 'get_screen()'
                },
                {
                    label: 'get_size',
                    detail: 'get_size()',
                    docs: 'DOC?',
                    insert: 'get_size()'
                },
                {
                    label: 'get_skip_pager_hint',
                    detail: 'get_skip_pager_hint()',
                    docs: 'DOC?',
                    insert: 'get_skip_pager_hint()'
                },
                {
                    label: 'get_skip_taskbar_hint',
                    detail: 'get_skip_taskbar_hint()',
                    docs: 'DOC?',
                    insert: 'get_skip_taskbar_hint()'
                },
                {
                    label: 'get_title',
                    detail: 'get_title()',
                    docs: 'DOC?',
                    insert: 'get_title()'
                },
                {
                    label: 'get_titlebar',
                    detail: 'get_titlebar()',
                    docs: 'DOC?',
                    insert: 'get_titlebar()'
                },
                {
                    label: 'get_transient_for',
                    detail: 'get_transient_for()',
                    docs: 'DOC?',
                    insert: 'get_transient_for()'
                },
                {
                    label: 'get_type_hint',
                    detail: 'get_type_hint()',
                    docs: 'DOC?',
                    insert: 'get_type_hint()'
                },
                {
                    label: 'get_urgency_hint',
                    detail: 'get_urgency_hint()',
                    docs: 'DOC?',
                    insert: 'get_urgency_hint()'
                },
                {
                    label: 'get_window_type',
                    detail: 'get_window_type()',
                    docs: 'DOC?',
                    insert: 'get_window_type()'
                },
                {
                    label: 'has_group',
                    detail: 'has_group()',
                    docs: 'DOC?',
                    insert: 'has_group()'
                },
                {
                    label: 'has_toplevel_focus',
                    detail: 'has_toplevel_focus()',
                    docs: 'DOC?',
                    insert: 'has_toplevel_focus()'
                },
                {
                    label: 'iconify',
                    detail: 'iconify()',
                    docs: 'DOC?',
                    insert: 'iconify()'
                },
                {
                    label: 'is_active',
                    detail: 'is_active()',
                    docs: 'DOC?',
                    insert: 'is_active()'
                },
                {
                    label: 'is_maximized',
                    detail: 'is_maximized()',
                    docs: 'DOC?',
                    insert: 'is_maximized()'
                },
                {
                    label: 'maximize',
                    detail: 'maximize()',
                    docs: 'DOC?',
                    insert: 'maximize()'
                },
                {
                    label: 'mnemonic_activate',
                    detail: 'mnemonic_activate(keyval, modifier)',
                    docs: 'DOC?',
                    insert: 'mnemonic_activate($1)'
                },
                {
                    label: 'move',
                    detail: 'move(x, y)',
                    docs: 'DOC?',
                    insert: 'move($1)'
                },
                {
                    label: 'parse_geometry',
                    detail: 'parse_geometry(geometry)',
                    docs: 'DOC?',
                    insert: 'parse_geometry($1)'
                },
                {
                    label: 'present',
                    detail: 'present()',
                    docs: 'DOC?',
                    insert: 'present()'
                },
                {
                    label: 'present_with_time',
                    detail: 'present_with_time(timestamp)',
                    docs: 'DOC?',
                    insert: 'present_with_time($1)'
                },
                {
                    label: 'propagate_key_event',
                    detail: 'propagate_key_event(event)',
                    docs: 'DOC?',
                    insert: 'propagate_key_event($1)'
                },
                {
                    label: 'remove_accel_group',
                    detail: 'remove_accel_group(accel_group)',
                    docs: 'DOC?',
                    insert: 'remove_accel_group($1)'
                },
                {
                    label: 'remove_mnemonic',
                    detail: 'remove_mnemonic(keyval, target)',
                    docs: 'DOC?',
                    insert: 'remove_mnemonic($1)'
                },
                {
                    label: 'reshow_with_initial_size',
                    detail: 'reshow_with_initial_size()',
                    docs: 'DOC?',
                    insert: 'reshow_with_initial_size()'
                },
                {
                    label: 'resize',
                    detail: 'resize(width, height)',
                    docs: 'DOC?',
                    insert: 'resize($1)'
                },
                {
                    label: 'resize_grip_is_visible',
                    detail: 'resize_grip_is_visible()',
                    docs: 'DOC?',
                    insert: 'resize_grip_is_visible()'
                },
                {
                    label: 'resize_to_geometry',
                    detail: 'resize_to_geometry(width, height)',
                    docs: 'DOC?',
                    insert: 'resize_to_geometry($1)'
                },
                {
                    label: 'set_accept_focus',
                    detail: 'set_accept_focus(setting)',
                    docs: 'DOC?',
                    insert: 'set_accept_focus($1)'
                },
                {
                    label: 'set_application',
                    detail: 'set_application(application)',
                    docs: 'DOC?',
                    insert: 'set_application($1)'
                },
                {
                    label: 'set_attached_to',
                    detail: 'set_attached_to(attach_widget)',
                    docs: 'DOC?',
                    insert: 'set_attached_to($1)'
                },
                {
                    label: 'set_decorated',
                    detail: 'set_decorated(setting)',
                    docs: 'DOC?',
                    insert: 'set_decorated($1)'
                },
                {
                    label: 'set_default',
                    detail: 'set_default(default_widget)',
                    docs: 'DOC?',
                    insert: 'set_default($1)'
                },
                {
                    label: 'set_default_geometry',
                    detail: 'set_default_geometry(width, height)',
                    docs: 'DOC?',
                    insert: 'set_default_geometry($1)'
                },
                {
                    label: 'set_default_size',
                    detail: 'set_default_size(width, height)',
                    docs: 'DOC?',
                    insert: 'set_default_size($1)'
                },
                {
                    label: 'set_deletable',
                    detail: 'set_deletable(setting)',
                    docs: 'DOC?',
                    insert: 'set_deletable($1)'
                },
                {
                    label: 'set_destroy_with_parent',
                    detail: 'set_destroy_with_parent(setting)',
                    docs: 'DOC?',
                    insert: 'set_destroy_with_parent($1)'
                },
                {
                    label: 'set_focus',
                    detail: 'set_focus(focus)',
                    docs: 'DOC?',
                    insert: 'set_focus($1)'
                },
                {
                    label: 'set_focus_on_map',
                    detail: 'set_focus_on_map(setting)',
                    docs: 'DOC?',
                    insert: 'set_focus_on_map($1)'
                },
                {
                    label: 'set_focus_visible',
                    detail: 'set_focus_visible(setting)',
                    docs: 'DOC?',
                    insert: 'set_focus_visible($1)'
                },
                {
                    label: 'set_geometry_hints',
                    detail: 'set_geometry_hints(geometry_widget, geometry, geom_mask)',
                    docs: 'DOC?',
                    insert: 'set_geometry_hints($1)'
                },
                {
                    label: 'set_gravity',
                    detail: 'set_gravity(gravity)',
                    docs: 'DOC?',
                    insert: 'set_gravity($1)'
                },
                {
                    label: 'set_has_resize_grip',
                    detail: 'set_has_resize_grip(value)',
                    docs: 'DOC?',
                    insert: 'set_has_resize_grip($1)'
                },
                {
                    label: 'set_has_user_ref_count',
                    detail: 'set_has_user_ref_count(setting)',
                    docs: 'DOC?',
                    insert: 'set_has_user_ref_count($1)'
                },
                {
                    label: 'set_hide_titlebar_when_maximized',
                    detail: 'set_hide_titlebar_when_maximized(setting)',
                    docs: 'DOC?',
                    insert: 'set_hide_titlebar_when_maximized($1)'
                },
                {
                    label: 'set_icon',
                    detail: 'set_icon(icon)',
                    docs: 'DOC?',
                    insert: 'set_icon($1)'
                },
                {
                    label: 'set_icon_from_file',
                    detail: 'set_icon_from_file(filename)',
                    docs: 'DOC?',
                    insert: 'set_icon_from_file($1)'
                },
                {
                    label: 'set_icon_list',
                    detail: 'set_icon_list(list)',
                    docs: 'DOC?',
                    insert: 'set_icon_list($1)'
                },
                {
                    label: 'set_icon_name',
                    detail: 'set_icon_name(name)',
                    docs: 'DOC?',
                    insert: 'set_icon_name($1)'
                },
                {
                    label: 'set_keep_above',
                    detail: 'set_keep_above(setting)',
                    docs: 'DOC?',
                    insert: 'set_keep_above($1)'
                },
                {
                    label: 'set_keep_below',
                    detail: 'set_keep_below(setting)',
                    docs: 'DOC?',
                    insert: 'set_keep_below($1)'
                },
                {
                    label: 'set_mnemonic_modifier',
                    detail: 'set_mnemonic_modifier(modifier)',
                    docs: 'DOC?',
                    insert: 'set_mnemonic_modifier($1)'
                },
                {
                    label: 'set_mnemonics_visible',
                    detail: 'set_mnemonics_visible(setting)',
                    docs: 'DOC?',
                    insert: 'set_mnemonics_visible($1)'
                },
                {
                    label: 'set_modal',
                    detail: 'set_modal(modal)',
                    docs: 'DOC?',
                    insert: 'set_modal($1)'
                },
                {
                    label: 'set_opacity',
                    detail: 'set_opacity(opacity)',
                    docs: 'DOC?',
                    insert: 'set_opacity($1)'
                },
                {
                    label: 'set_position',
                    detail: 'set_position(position)',
                    docs: 'DOC?',
                    insert: 'set_position($1)'
                },
                {
                    label: 'set_resizable',
                    detail: 'set_resizable(resizable)',
                    docs: 'DOC?',
                    insert: 'set_resizable($1)'
                },
                {
                    label: 'set_role',
                    detail: 'set_role(role)',
                    docs: 'DOC?',
                    insert: 'set_role($1)'
                },
                {
                    label: 'set_screen',
                    detail: 'set_screen(screen)',
                    docs: 'DOC?',
                    insert: 'set_screen($1)'
                },
                {
                    label: 'set_skip_pager_hint',
                    detail: 'set_skip_pager_hint(setting)',
                    docs: 'DOC?',
                    insert: 'set_skip_pager_hint($1)'
                },
                {
                    label: 'set_skip_taskbar_hint',
                    detail: 'set_skip_taskbar_hint(setting)',
                    docs: 'DOC?',
                    insert: 'set_skip_taskbar_hint($1)'
                },
                {
                    label: 'set_startup_id',
                    detail: 'set_startup_id(startup_id)',
                    docs: 'DOC?',
                    insert: 'set_startup_id($1)'
                },
                {
                    label: 'set_title',
                    detail: 'set_title(title)',
                    docs: 'DOC?',
                    insert: 'set_title($1)'
                },
                {
                    label: 'set_titlebar',
                    detail: 'set_titlebar(titlebar)',
                    docs: 'DOC?',
                    insert: 'set_titlebar($1)'
                },
                {
                    label: 'set_transient_for',
                    detail: 'set_transient_for(parent)',
                    docs: 'DOC?',
                    insert: 'set_transient_for($1)'
                },
                {
                    label: 'set_type_hint',
                    detail: 'set_type_hint(hint)',
                    docs: 'DOC?',
                    insert: 'set_type_hint($1)'
                },
                {
                    label: 'set_urgency_hint',
                    detail: 'set_urgency_hint(setting)',
                    docs: 'DOC?',
                    insert: 'set_urgency_hint($1)'
                },
                {
                    label: 'set_wmclass',
                    detail: 'set_wmclass(wmclass_name, wmclass_class)',
                    docs: 'DOC?',
                    insert: 'set_wmclass($1)'
                },
                {
                    label: 'stick',
                    detail: 'stick()',
                    docs: 'DOC?',
                    insert: 'stick()'
                },
                {
                    label: 'unfullscreen',
                    detail: 'unfullscreen()',
                    docs: 'DOC?',
                    insert: 'unfullscreen()'
                },
                {
                    label: 'unmaximize',
                    detail: 'unmaximize()',
                    docs: 'DOC?',
                    insert: 'unmaximize()'
                },
                {
                    label: 'unstick',
                    detail: 'unstick()',
                    docs: 'DOC?',
                    insert: 'unstick()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkDialog = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'add_action_widget',
                    detail: 'add_action_widget(child, response_id)',
                    docs: 'DOC?',
                    insert: 'add_action_widget($1)'
                },
                {
                    label: 'add_button',
                    detail: 'add_button(button_text, response_id)',
                    docs: 'DOC?',
                    insert: 'add_button($1)'
                },
                {
                    label: 'add_buttons',
                    detail: 'add_buttons(*args)',
                    docs: 'DOC?',
                    insert: 'add_buttons($1)'
                },
                {
                    label: 'get_action_area',
                    detail: 'get_action_area()',
                    docs: 'DOC?',
                    insert: 'get_action_area()'
                },
                {
                    label: 'get_content_area',
                    detail: 'get_content_area()',
                    docs: 'DOC?',
                    insert: 'get_content_area()'
                },
                {
                    label: 'get_header_bar',
                    detail: 'get_header_bar()',
                    docs: 'DOC?',
                    insert: 'get_header_bar()'
                },
                {
                    label: 'get_response_for_widget',
                    detail: 'get_response_for_widget(widget)',
                    docs: 'DOC?',
                    insert: 'get_response_for_widget($1)'
                },
                {
                    label: 'get_widget_for_response',
                    detail: 'get_widget_for_response(response_id)',
                    docs: 'DOC?',
                    insert: 'get_widget_for_response($1)'
                },
                {
                    label: 'response',
                    detail: 'response(response_id)',
                    docs: 'DOC?',
                    insert: 'response($1)'
                },
                {
                    label: 'run',
                    detail: 'run()',
                    docs: 'DOC?',
                    insert: 'run()'
                },
                {
                    label: 'set_alternative_button_order_from_array',
                    detail: 'set_alternative_button_order_from_array(new_order)',
                    docs: 'DOC?',
                    insert: 'set_alternative_button_order_from_array($1)'
                },
                {
                    label: 'set_default_response',
                    detail: 'set_default_response(response_id)',
                    docs: 'DOC?',
                    insert: 'set_default_response($1)'
                },
                {
                    label: 'set_response_sensitive',
                    detail: 'set_response_sensitive(response_id, setting)',
                    docs: 'DOC?',
                    insert: 'set_response_sensitive($1)'
                },
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkLabel = [
                {
                    label: 'new',
                    detail: 'new(str)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'new_with_mnemonic',
                    detail: 'new_with_mnemonic(str)',
                    docs: 'DOC?',
                    insert: 'new_with_mnemonic($1)'
                },
                {
                    label: 'get_angle',
                    detail: 'get_angle()',
                    docs: 'DOC?',
                    insert: 'get_angle()'
                },
                {
                    label: 'get_attributes',
                    detail: 'get_attributes()',
                    docs: 'DOC?',
                    insert: 'get_attributes()'
                },
                {
                    label: 'get_current_uri',
                    detail: 'get_current_uri()',
                    docs: 'DOC?',
                    insert: 'get_current_uri()'
                },
                {
                    label: 'get_ellipsize',
                    detail: 'get_ellipsize()',
                    docs: 'DOC?',
                    insert: 'get_ellipsize()'
                },
                {
                    label: 'get_justify',
                    detail: 'get_justify()',
                    docs: 'DOC?',
                    insert: 'get_justify()'
                },
                {
                    label: 'get_label',
                    detail: 'get_label()',
                    docs: 'DOC?',
                    insert: 'get_label()'
                },
                {
                    label: 'get_layout',
                    detail: 'get_layout()',
                    docs: 'DOC?',
                    insert: 'get_layout()'
                },
                {
                    label: 'get_layout_offsets',
                    detail: 'get_layout_offsets()',
                    docs: 'DOC?',
                    insert: 'get_layout_offsets()'
                },
                {
                    label: 'get_line_wrap',
                    detail: 'get_line_wrap()',
                    docs: 'DOC?',
                    insert: 'get_line_wrap()'
                },
                {
                    label: 'get_line_wrap_mode',
                    detail: 'get_line_wrap_mode()',
                    docs: 'DOC?',
                    insert: 'get_line_wrap_mode()'
                },
                {
                    label: 'get_lines',
                    detail: 'get_lines()',
                    docs: 'DOC?',
                    insert: 'get_lines()'
                },
                {
                    label: 'get_max_width_chars',
                    detail: 'get_max_width_chars()',
                    docs: 'DOC?',
                    insert: 'get_max_width_chars()'
                },
                {
                    label: 'get_mnemonic_keyval',
                    detail: 'get_mnemonic_keyval()',
                    docs: 'DOC?',
                    insert: 'get_mnemonic_keyval()'
                },
                {
                    label: 'get_mnemonic_widget',
                    detail: 'get_mnemonic_widget()',
                    docs: 'DOC?',
                    insert: 'get_mnemonic_widget()'
                },
                {
                    label: 'get_selectable',
                    detail: 'get_selectable()',
                    docs: 'DOC?',
                    insert: 'get_selectable()'
                },
                {
                    label: 'get_selection_bounds',
                    detail: 'get_selection_bounds()',
                    docs: 'DOC?',
                    insert: 'get_selection_bounds()'
                },
                {
                    label: 'get_single_line_mode',
                    detail: 'get_single_line_mode()',
                    docs: 'DOC?',
                    insert: 'get_single_line_mode()'
                },
                {
                    label: 'get_text',
                    detail: 'get_text()',
                    docs: 'DOC?',
                    insert: 'get_text()'
                },
                {
                    label: 'get_track_visited_links',
                    detail: 'get_track_visited_links()',
                    docs: 'DOC?',
                    insert: 'get_track_visited_links()'
                },
                {
                    label: 'get_use_markup',
                    detail: 'get_use_markup()',
                    docs: 'DOC?',
                    insert: 'get_use_markup()'
                },
                {
                    label: 'get_use_underline',
                    detail: 'get_use_underline()',
                    docs: 'DOC?',
                    insert: 'get_use_underline()'
                },
                {
                    label: 'get_width_chars',
                    detail: 'get_width_chars()',
                    docs: 'DOC?',
                    insert: 'get_width_chars()'
                },
                {
                    label: 'get_xalign',
                    detail: 'get_xalign()',
                    docs: 'DOC?',
                    insert: 'get_xalign()'
                },
                {
                    label: 'get_yalign',
                    detail: 'get_yalign()',
                    docs: 'DOC?',
                    insert: 'get_yalign()'
                },
                {
                    label: 'select_region',
                    detail: 'select_region(start_offset, end_offset)',
                    docs: 'DOC?',
                    insert: 'select_region($1)'
                },
                {
                    label: 'set_angle',
                    detail: 'set_angle(angle)',
                    docs: 'DOC?',
                    insert: 'set_angle($1)'
                },
                {
                    label: 'set_attributes',
                    detail: 'set_attributes(attrs)',
                    docs: 'DOC?',
                    insert: 'set_attributes($1)'
                },
                {
                    label: 'set_ellipsize',
                    detail: 'set_ellipsize(mode)',
                    docs: 'DOC?',
                    insert: 'set_ellipsize($1)'
                },
                {
                    label: 'set_justify',
                    detail: 'set_justify(jtype)',
                    docs: 'DOC?',
                    insert: 'set_justify($1)'
                },
                {
                    label: 'set_label',
                    detail: 'set_label(str)',
                    docs: 'DOC?',
                    insert: 'set_label($1)'
                },
                {
                    label: 'set_line_wrap',
                    detail: 'set_line_wrap(wrap)',
                    docs: 'DOC?',
                    insert: 'set_line_wrap($1)'
                },
                {
                    label: 'set_line_wrap_mode',
                    detail: 'set_line_wrap_mode(wrap_mode)',
                    docs: 'DOC?',
                    insert: 'set_line_wrap_mode($1)'
                },
                {
                    label: 'set_lines',
                    detail: 'set_lines(lines)',
                    docs: 'DOC?',
                    insert: 'set_lines($1)'
                },
                {
                    label: 'set_markup',
                    detail: 'set_markup(str)',
                    docs: 'DOC?',
                    insert: 'set_markup($1)'
                },
                {
                    label: 'set_markup_with_mnemonic',
                    detail: 'set_markup_with_mnemonic(str)',
                    docs: 'DOC?',
                    insert: 'set_markup_with_mnemonic($1)'
                },
                {
                    label: 'set_max_width_chars',
                    detail: 'set_max_width_chars(n_chars)',
                    docs: 'DOC?',
                    insert: 'set_max_width_chars($1)'
                },
                {
                    label: 'set_mnemonic_widget',
                    detail: 'set_mnemonic_widget(widget)',
                    docs: 'DOC?',
                    insert: 'set_mnemonic_widget($1)'
                },
                {
                    label: 'set_pattern',
                    detail: 'set_pattern(pattern)',
                    docs: 'DOC?',
                    insert: 'set_pattern($1)'
                },
                {
                    label: 'set_selectable',
                    detail: 'set_selectable(setting)',
                    docs: 'DOC?',
                    insert: 'set_selectable($1)'
                },
                {
                    label: 'set_single_line_mode',
                    detail: 'set_single_line_mode(single_line_mode)',
                    docs: 'DOC?',
                    insert: 'set_single_line_mode($1)'
                },
                {
                    label: 'set_text',
                    detail: 'set_text(str)',
                    docs: 'DOC?',
                    insert: 'set_text($1)'
                },
                {
                    label: 'set_text_with_mnemonic',
                    detail: 'set_text_with_mnemonic(str)',
                    docs: 'DOC?',
                    insert: 'set_text_with_mnemonic($1)'
                },
                {
                    label: 'set_track_visited_links',
                    detail: 'set_track_visited_links(track_links)',
                    docs: 'DOC?',
                    insert: 'set_track_visited_links($1)'
                },
                {
                    label: 'set_use_markup',
                    detail: 'set_use_markup(setting)',
                    docs: 'DOC?',
                    insert: 'set_use_markup($1)'
                },
                {
                    label: 'set_use_underline',
                    detail: 'set_use_underline(setting)',
                    docs: 'DOC?',
                    insert: 'set_use_underline($1)'
                },
                {
                    label: 'set_width_chars',
                    detail: 'set_width_chars(n_chars)',
                    docs: 'DOC?',
                    insert: 'set_width_chars($1)'
                },
                {
                    label: 'set_xalign',
                    detail: 'set_xalign(xalign)',
                    docs: 'DOC?',
                    insert: 'set_xalign($1)'
                },
                {
                    label: 'set_yalign',
                    detail: 'set_yalign(yalign)',
                    docs: 'DOC?',
                    insert: 'set_yalign($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkAccelLabel = [
                {
                    label: 'new',
                    detail: 'new(string)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'get_accel',
                    detail: 'get_accel()',
                    docs: 'DOC?',
                    insert: 'get_accel()'
                },
                {
                    label: 'get_accel_widget',
                    detail: 'get_accel_widget()',
                    docs: 'DOC?',
                    insert: 'get_accel_widget()'
                },
                {
                    label: 'get_accel_width',
                    detail: 'get_accel_width()',
                    docs: 'DOC?',
                    insert: 'get_accel_width()'
                },
                {
                    label: 'refetch',
                    detail: 'refetch()',
                    docs: 'DOC?',
                    insert: 'refetch()'
                },
                {
                    label: 'set_accel',
                    detail: 'set_accel(accelerator_key, accelerator_mods)',
                    docs: 'DOC?',
                    insert: 'set_accel($1)'
                },
                {
                    label: 'set_accel_closure',
                    detail: 'set_accel_closure(accel_closure)',
                    docs: 'DOC?',
                    insert: 'set_accel_closure($1)'
                },
                {
                    label: 'set_accel_widget',
                    detail: 'set_accel_widget(accel_widget)',
                    docs: 'DOC?',
                    insert: 'set_accel_widget($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkActionBar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'get_center_widget',
                    detail: 'get_center_widget()',
                    docs: 'DOC?',
                    insert: 'get_center_widget()'
                },
                {
                    label: 'pack_end',
                    detail: 'pack_end(child)',
                    docs: 'DOC?',
                    insert: 'pack_end($1)'
                },
                {
                    label: 'pack_start',
                    detail: 'pack_start(child)',
                    docs: 'DOC?',
                    insert: 'pack_start($1)'
                },
                {
                    label: 'set_center_widget',
                    detail: 'set_center_widget(center_widget)',
                    docs: 'DOC?',
                    insert: 'set_center_widget($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkAppChooserButton = [
                {
                    label: 'new',
                    detail: 'new(content_type)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'append_custom_item',
                    detail: 'append_custom_item(name, label, icon)',
                    docs: 'DOC?',
                    insert: 'append_custom_item($1)'
                },
                {
                    label: 'append_separator',
                    detail: 'append_separator()',
                    docs: 'DOC?',
                    insert: 'append_separator()'
                },
                {
                    label: 'get_heading',
                    detail: 'get_heading()',
                    docs: 'DOC?',
                    insert: 'get_heading()'
                },
                {
                    label: 'get_show_default_item',
                    detail: 'get_show_default_item()',
                    docs: 'DOC?',
                    insert: 'get_show_default_item()'
                },
                {
                    label: 'get_show_dialog_item',
                    detail: 'get_show_dialog_item()',
                    docs: 'DOC?',
                    insert: 'get_show_dialog_item()'
                },
                {
                    label: 'set_active_custom_item',
                    detail: 'set_active_custom_item(name)',
                    docs: 'DOC?',
                    insert: 'set_active_custom_item($1)'
                },
                {
                    label: 'set_heading',
                    detail: 'set_heading(heading)',
                    docs: 'DOC?',
                    insert: 'set_heading($1)'
                },
                {
                    label: 'set_show_default_item',
                    detail: 'set_show_default_item(setting)',
                    docs: 'DOC?',
                    insert: 'set_show_default_item($1)'
                },
                {
                    label: 'set_show_dialog_item',
                    detail: 'set_show_dialog_item(setting)',
                    docs: 'DOC?',
                    insert: 'set_show_dialog_item($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkComboBox = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_with_area',
                    detail: 'new_with_area(area)',
                    docs: 'DOC?',
                    insert: 'new_with_area($1)'
                },
                {
                    label: 'new_with_area_and_entry',
                    detail: 'new_with_area_and_entry(area)',
                    docs: 'DOC?',
                    insert: 'new_with_area_and_entry($1)'
                },
                {
                    label: 'new_with_entry',
                    detail: 'new_with_entry()',
                    docs: 'DOC?',
                    insert: 'new_with_entry()'
                },
                {
                    label: 'new_with_model',
                    detail: 'new_with_model(model)',
                    docs: 'DOC?',
                    insert: 'new_with_model($1)'
                },
                {
                    label: 'new_with_model_and_entry',
                    detail: 'new_with_model_and_entry(model)',
                    docs: 'DOC?',
                    insert: 'new_with_model_and_entry($1)'
                },
                {
                    label: 'get_active',
                    detail: 'get_active()',
                    docs: 'DOC?',
                    insert: 'get_active()'
                },
                {
                    label: 'get_active_id',
                    detail: 'get_active_id()',
                    docs: 'DOC?',
                    insert: 'get_active_id()'
                },
                {
                    label: 'get_active_iter',
                    detail: 'get_active_iter()',
                    docs: 'DOC?',
                    insert: 'get_active_iter()'
                },
                {
                    label: 'get_add_tearoffs',
                    detail: 'get_add_tearoffs()',
                    docs: 'DOC?',
                    insert: 'get_add_tearoffs()'
                },
                {
                    label: 'get_button_sensitivity',
                    detail: 'get_button_sensitivity()',
                    docs: 'DOC?',
                    insert: 'get_button_sensitivity()'
                },
                {
                    label: 'get_column_span_column',
                    detail: 'get_column_span_column()',
                    docs: 'DOC?',
                    insert: 'get_column_span_column()'
                },
                {
                    label: 'get_entry_text_column',
                    detail: 'get_entry_text_column()',
                    docs: 'DOC?',
                    insert: 'get_entry_text_column()'
                },
                {
                    label: 'get_focus_on_click',
                    detail: 'get_focus_on_click()',
                    docs: 'DOC?',
                    insert: 'get_focus_on_click()'
                },
                {
                    label: 'get_has_entry',
                    detail: 'get_has_entry()',
                    docs: 'DOC?',
                    insert: 'get_has_entry()'
                },
                {
                    label: 'get_id_column',
                    detail: 'get_id_column()',
                    docs: 'DOC?',
                    insert: 'get_id_column()'
                },
                {
                    label: 'get_model',
                    detail: 'get_model()',
                    docs: 'DOC?',
                    insert: 'get_model()'
                },
                {
                    label: 'get_popup_accessible',
                    detail: 'get_popup_accessible()',
                    docs: 'DOC?',
                    insert: 'get_popup_accessible()'
                },
                {
                    label: 'get_popup_fixed_width',
                    detail: 'get_popup_fixed_width()',
                    docs: 'DOC?',
                    insert: 'get_popup_fixed_width()'
                },
                {
                    label: 'get_row_span_column',
                    detail: 'get_row_span_column()',
                    docs: 'DOC?',
                    insert: 'get_row_span_column()'
                },
                {
                    label: 'get_title',
                    detail: 'get_title()',
                    docs: 'DOC?',
                    insert: 'get_title()'
                },
                {
                    label: 'get_wrap_width',
                    detail: 'get_wrap_width()',
                    docs: 'DOC?',
                    insert: 'get_wrap_width()'
                },
                {
                    label: 'popdown',
                    detail: 'popdown()',
                    docs: 'DOC?',
                    insert: 'popdown()'
                },
                {
                    label: 'popup',
                    detail: 'popup()',
                    docs: 'DOC?',
                    insert: 'popup()'
                },
                {
                    label: 'popup_for_device',
                    detail: 'popup_for_device(device)',
                    docs: 'DOC?',
                    insert: 'popup_for_device($1)'
                },
                {
                    label: 'set_active',
                    detail: 'set_active(index_)',
                    docs: 'DOC?',
                    insert: 'set_active($1)'
                },
                {
                    label: 'set_active_id',
                    detail: 'set_active_id(active_id)',
                    docs: 'DOC?',
                    insert: 'set_active_id($1)'
                },
                {
                    label: 'set_active_iter',
                    detail: 'set_active_iter(iter)',
                    docs: 'DOC?',
                    insert: 'set_active_iter($1)'
                },
                {
                    label: 'set_add_tearoffs',
                    detail: 'set_add_tearoffs(add_tearoffs)',
                    docs: 'DOC?',
                    insert: 'set_add_tearoffs($1)'
                },
                {
                    label: 'set_button_sensitivity',
                    detail: 'set_button_sensitivity(sensitivity)',
                    docs: 'DOC?',
                    insert: 'set_button_sensitivity($1)'
                },
                {
                    label: 'set_column_span_column',
                    detail: 'set_column_span_column(column_span)',
                    docs: 'DOC?',
                    insert: 'set_column_span_column($1)'
                },
                {
                    label: 'set_entry_text_column',
                    detail: 'set_entry_text_column(text_column)',
                    docs: 'DOC?',
                    insert: 'set_entry_text_column($1)'
                },
                {
                    label: 'set_focus_on_click',
                    detail: 'set_focus_on_click(focus_on_click)',
                    docs: 'DOC?',
                    insert: 'set_focus_on_click($1)'
                },
                {
                    label: 'set_id_column',
                    detail: 'set_id_column(id_column)',
                    docs: 'DOC?',
                    insert: 'set_id_column($1)'
                },
                {
                    label: 'set_model',
                    detail: 'set_model(model)',
                    docs: 'DOC?',
                    insert: 'set_model($1)'
                },
                {
                    label: 'set_popup_fixed_width',
                    detail: 'set_popup_fixed_width(fixed)',
                    docs: 'DOC?',
                    insert: 'set_popup_fixed_width($1)'
                },
                {
                    label: 'set_row_separator_func',
                    detail: 'set_row_separator_func(func, *data)',
                    docs: 'DOC?',
                    insert: 'set_row_separator_func($1)'
                },
                {
                    label: 'set_row_span_column',
                    detail: 'set_row_span_column(row_span)',
                    docs: 'DOC?',
                    insert: 'set_row_span_column($1)'
                },
                {
                    label: 'set_title',
                    detail: 'set_title(title)',
                    docs: 'DOC?',
                    insert: 'set_title($1)'
                },
                {
                    label: 'set_wrap_width',
                    detail: 'set_wrap_width(width)',
                    docs: 'DOC?',
                    insert: 'set_wrap_width($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkCellEditable = [
                {
                    label: 'editing_done',
                    detail: 'editing_done()',
                    docs: 'DOC?',
                    insert: 'editing_done()'
                },
                {
                    label: 'remove_widget',
                    detail: 'remove_widget()',
                    docs: 'DOC?',
                    insert: 'remove_widget()'
                },
                {
                    label: 'start_editing',
                    detail: 'start_editing(event)',
                    docs: 'DOC?',
                    insert: 'start_editing($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkCellLayout = [
                {
                    label: 'add_attribute',
                    detail: 'add_attribute(cell, attribute, column)',
                    docs: 'DOC?',
                    insert: 'add_attribute($1)'
                },
                {
                    label: 'clear',
                    detail: 'clear()',
                    docs: 'DOC?',
                    insert: 'clear()'
                },
                {
                    label: 'clear_attributes',
                    detail: 'clear_attributes(cell)',
                    docs: 'DOC?',
                    insert: 'clear_attributes($1)'
                },
                {
                    label: 'get_area',
                    detail: 'get_area()',
                    docs: 'DOC?',
                    insert: 'get_area()'
                },
                {
                    label: 'get_cells',
                    detail: 'get_cells()',
                    docs: 'DOC?',
                    insert: 'get_cells()'
                },
                {
                    label: 'pack_end',
                    detail: 'pack_end(cell, expand)',
                    docs: 'DOC?',
                    insert: 'pack_end($1)'
                },
                {
                    label: 'pack_start',
                    detail: 'pack_start(cell, expand)',
                    docs: 'DOC?',
                    insert: 'pack_start($1)'
                },
                {
                    label: 'reorder',
                    detail: 'reorder(cell, position)',
                    docs: 'DOC?',
                    insert: 'reorder($1)'
                },
                {
                    label: 'set_cell_data_func',
                    detail: 'set_cell_data_func(cell, func, *func_data)',
                    docs: 'DOC?',
                    insert: 'set_cell_data_func($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkAppChooser = [
                {
                    label: 'get_app_info',
                    detail: 'get_app_info()',
                    docs: 'DOC?',
                    insert: 'get_app_info()'
                },
                {
                    label: 'get_content_type',
                    detail: 'get_content_type()',
                    docs: 'DOC?',
                    insert: 'get_content_type()'
                },
                {
                    label: 'refresh',
                    detail: 'refresh()',
                    docs: 'DOC?',
                    insert: 'refresh()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkButton = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_from_icon_name',
                    detail: 'new_from_icon_name(icon_name, size)',
                    docs: 'DOC?',
                    insert: 'new_from_icon_name($1)'
                },
                {
                    label: 'new_from_stock',
                    detail: 'new_from_stock(stock_id)',
                    docs: 'DOC?',
                    insert: 'new_from_stock($1)'
                },
                {
                    label: 'new_with_label',
                    detail: 'new_with_label(label)',
                    docs: 'DOC?',
                    insert: 'new_with_label($1)'
                },
                {
                    label: 'new_with_mnemonic',
                    detail: 'new_with_mnemonic(label)',
                    docs: 'DOC?',
                    insert: 'new_with_mnemonic($1)'
                },
                {
                    label: 'clicked',
                    detail: 'clicked()',
                    docs: 'DOC?',
                    insert: 'clicked()'
                },
                {
                    label: 'enter',
                    detail: 'enter()',
                    docs: 'DOC?',
                    insert: 'enter()'
                },
                {
                    label: 'get_alignment',
                    detail: 'get_alignment()',
                    docs: 'DOC?',
                    insert: 'get_alignment()'
                },
                {
                    label: 'get_always_show_image',
                    detail: 'get_always_show_image()',
                    docs: 'DOC?',
                    insert: 'get_always_show_image()'
                },
                {
                    label: 'get_event_window',
                    detail: 'get_event_window()',
                    docs: 'DOC?',
                    insert: 'get_event_window()'
                },
                {
                    label: 'get_focus_on_click',
                    detail: 'get_focus_on_click()',
                    docs: 'DOC?',
                    insert: 'get_focus_on_click()'
                },
                {
                    label: 'get_image',
                    detail: 'get_image()',
                    docs: 'DOC?',
                    insert: 'get_image()'
                },
                {
                    label: 'get_image_position',
                    detail: 'get_image_position()',
                    docs: 'DOC?',
                    insert: 'get_image_position()'
                },
                {
                    label: 'get_label',
                    detail: 'get_label()',
                    docs: 'DOC?',
                    insert: 'get_label()'
                },
                {
                    label: 'get_relief',
                    detail: 'get_relief()',
                    docs: 'DOC?',
                    insert: 'get_relief()'
                },
                {
                    label: 'get_use_stock',
                    detail: 'get_use_stock()',
                    docs: 'DOC?',
                    insert: 'get_use_stock()'
                },
                {
                    label: 'get_use_underline',
                    detail: 'get_use_underline()',
                    docs: 'DOC?',
                    insert: 'get_use_underline()'
                },
                {
                    label: 'leave',
                    detail: 'leave()',
                    docs: 'DOC?',
                    insert: 'leave()'
                },
                {
                    label: 'pressed',
                    detail: 'pressed()',
                    docs: 'DOC?',
                    insert: 'pressed()'
                },
                {
                    label: 'released',
                    detail: 'released()',
                    docs: 'DOC?',
                    insert: 'released()'
                },
                {
                    label: 'set_alignment',
                    detail: 'set_alignment(xalign, yalign)',
                    docs: 'DOC?',
                    insert: 'set_alignment($1)'
                },
                {
                    label: 'set_always_show_image',
                    detail: 'set_always_show_image(always_show)',
                    docs: 'DOC?',
                    insert: 'set_always_show_image($1)'
                },
                {
                    label: 'set_focus_on_click',
                    detail: 'set_focus_on_click(focus_on_click)',
                    docs: 'DOC?',
                    insert: 'set_focus_on_click($1)'
                },
                {
                    label: 'set_image',
                    detail: 'set_image(image)',
                    docs: 'DOC?',
                    insert: 'set_image($1)'
                },
                {
                    label: 'set_image_position',
                    detail: 'set_image_position(position)',
                    docs: 'DOC?',
                    insert: 'set_image_position($1)'
                },
                {
                    label: 'set_label',
                    detail: 'set_label(label)',
                    docs: 'DOC?',
                    insert: 'set_label($1)'
                },
                {
                    label: 'set_relief',
                    detail: 'set_relief(relief)',
                    docs: 'DOC?',
                    insert: 'set_relief($1)'
                },
                {
                    label: 'set_use_stock',
                    detail: 'set_use_stock(use_stock)',
                    docs: 'DOC?',
                    insert: 'set_use_stock($1)'
                },
                {
                    label: 'set_use_underline',
                    detail: 'set_use_underline(use_underline)',
                    docs: 'DOC?',
                    insert: 'set_use_underline($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkActionable = [
                {
                    label: 'get_action_name',
                    detail: 'get_action_name()',
                    docs: 'DOC?',
                    insert: 'get_action_name()'
                },
                {
                    label: 'get_action_target_value',
                    detail: 'get_action_target_value()',
                    docs: 'DOC?',
                    insert: 'get_action_target_value()'
                },
                {
                    label: 'set_action_name',
                    detail: 'set_action_name(action_name)',
                    docs: 'DOC?',
                    insert: 'set_action_name($1)'
                },
                {
                    label: 'set_action_target_value',
                    detail: 'set_action_target_value(target_value)',
                    docs: 'DOC?',
                    insert: 'set_action_target_value($1)'
                },
                {
                    label: 'set_detailed_action_name',
                    detail: 'set_detailed_action_name(detailed_action_name)',
                    docs: 'DOC?',
                    insert: 'set_detailed_action_name($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkActivatable = [
                {
                    label: 'do_set_related_action',
                    detail: 'do_set_related_action(action)',
                    docs: 'DOC?',
                    insert: 'do_set_related_action($1)'
                },
                {
                    label: 'get_related_action',
                    detail: 'get_related_action()',
                    docs: 'DOC?',
                    insert: 'get_related_action()'
                },
                {
                    label: 'get_use_action_appearance',
                    detail: 'get_use_action_appearance()',
                    docs: 'DOC?',
                    insert: 'get_use_action_appearance()'
                },
                {
                    label: 'set_related_action',
                    detail: 'set_related_action(action)',
                    docs: 'DOC?',
                    insert: 'set_related_action($1)'
                },
                {
                    label: 'set_use_action_appearance',
                    detail: 'set_use_action_appearance(use_appearance)',
                    docs: 'DOC?',
                    insert: 'set_use_action_appearance($1)'
                },
                {
                    label: 'sync_action_properties',
                    detail: 'sync_action_properties(action)',
                    docs: 'DOC?',
                    insert: 'sync_action_properties($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkCheckButton = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_with_label',
                    detail: 'new_with_label(label)',
                    docs: 'DOC?',
                    insert: 'new_with_label($1)'
                },
                {
                    label: 'new_with_mnemonic',
                    detail: 'new_with_mnemonic(label)',
                    docs: 'DOC?',
                    insert: 'new_with_mnemonic($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkToggleButton = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_with_label',
                    detail: 'new_with_label(label)',
                    docs: 'DOC?',
                    insert: 'new_with_label($1)'
                },
                {
                    label: 'new_with_mnemonic',
                    detail: 'new_with_mnemonic(label)',
                    docs: 'DOC?',
                    insert: 'new_with_mnemonic($1)'
                },
                {
                    label: 'get_active',
                    detail: 'get_active()',
                    docs: 'DOC?',
                    insert: 'get_active()'
                },
                {
                    label: 'get_inconsistent',
                    detail: 'get_inconsistent()',
                    docs: 'DOC?',
                    insert: 'get_inconsistent()'
                },
                {
                    label: 'get_mode',
                    detail: 'get_mode()',
                    docs: 'DOC?',
                    insert: 'get_mode()'
                },
                {
                    label: 'set_active',
                    detail: 'set_active(is_active)',
                    docs: 'DOC?',
                    insert: 'set_active($1)'
                },
                {
                    label: 'set_inconsistent',
                    detail: 'set_inconsistent(setting)',
                    docs: 'DOC?',
                    insert: 'set_inconsistent($1)'
                },
                {
                    label: 'set_mode',
                    detail: 'set_mode(draw_indicator)',
                    docs: 'DOC?',
                    insert: 'set_mode($1)'
                },
                {
                    label: 'toggled',
                    detail: 'toggled()',
                    docs: 'DOC?',
                    insert: 'toggled()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkColorChooser = [
                {
                    label: 'add_palette',
                    detail: 'add_palette(orientation, colors_per_line, colors)',
                    docs: 'DOC?',
                    insert: 'add_palette($1)'
                },
                {
                    label: 'get_rgba',
                    detail: 'get_rgba()',
                    docs: 'DOC?',
                    insert: 'get_rgba()'
                },
                {
                    label: 'get_use_alpha',
                    detail: 'get_use_alpha()',
                    docs: 'DOC?',
                    insert: 'get_use_alpha()'
                },
                {
                    label: 'set_rgba',
                    detail: 'set_rgba(color)',
                    docs: 'DOC?',
                    insert: 'set_rgba($1)'
                },
                {
                    label: 'set_use_alpha',
                    detail: 'set_use_alpha(use_alpha)',
                    docs: 'DOC?',
                    insert: 'set_use_alpha($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkColorButton = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_with_color',
                    detail: 'new_with_color(color)',
                    docs: 'DOC?',
                    insert: 'new_with_color($1)'
                },
                {
                    label: 'new_with_rgba',
                    detail: 'new_with_rgba(rgba)',
                    docs: 'DOC?',
                    insert: 'new_with_rgba($1)'
                },
                {
                    label: 'get_alpha',
                    detail: 'get_alpha()',
                    docs: 'DOC?',
                    insert: 'get_alpha()'
                },
                {
                    label: 'get_color',
                    detail: 'get_color()',
                    docs: 'DOC?',
                    insert: 'get_color()'
                },
                {
                    label: 'get_title',
                    detail: 'get_title()',
                    docs: 'DOC?',
                    insert: 'get_title()'
                },
                {
                    label: 'get_use_alpha',
                    detail: 'get_use_alpha()',
                    docs: 'DOC?',
                    insert: 'get_use_alpha()'
                },
                {
                    label: 'set_alpha',
                    detail: 'set_alpha(alpha)',
                    docs: 'DOC?',
                    insert: 'set_alpha($1)'
                },
                {
                    label: 'set_color',
                    detail: 'set_color(color)',
                    docs: 'DOC?',
                    insert: 'set_color($1)'
                },
                {
                    label: 'set_title',
                    detail: 'set_title(title)',
                    docs: 'DOC?',
                    insert: 'set_title($1)'
                },
                {
                    label: 'set_use_alpha',
                    detail: 'set_use_alpha(use_alpha)',
                    docs: 'DOC?',
                    insert: 'set_use_alpha($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkTreeDragDest = [
                {
                    label: 'drag_data_received',
                    detail: 'drag_data_received(dest, selection_data)',
                    docs: 'DOC?',
                    insert: 'drag_data_received($1)'
                },
                {
                    label: 'row_drop_possible',
                    detail: 'row_drop_possible(dest_path, selection_data)',
                    docs: 'DOC?',
                    insert: 'row_drop_possible($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkTreeDragSource = [
                {
                    label: 'drag_data_delete',
                    detail: 'drag_data_delete(path)',
                    docs: 'DOC?',
                    insert: 'drag_data_delete($1)'
                },
                {
                    label: 'drag_data_get',
                    detail: 'drag_data_get(path, selection_data)',
                    docs: 'DOC?',
                    insert: 'drag_data_get($1)'
                },
                {
                    label: 'row_draggable',
                    detail: 'row_draggable(path)',
                    docs: 'DOC?',
                    insert: 'row_draggable($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkTreeModel = [
                {
                    label: 'filter_new',
                    detail: 'filter_new(root)',
                    docs: 'DOC?',
                    insert: 'filter_new($1)'
                },
                {
                    label: 'foreach',
                    detail: 'foreach(func, *user_data)',
                    docs: 'DOC?',
                    insert: 'foreach($1)'
                },
                {
                    label: 'get',
                    detail: 'get(treeiter, *columns)',
                    docs: 'DOC?',
                    insert: 'get($1)'
                },
                {
                    label: 'get_column_type',
                    detail: 'get_column_type(index_)',
                    docs: 'DOC?',
                    insert: 'get_column_type($1)'
                },
                {
                    label: 'get_flags',
                    detail: 'get_flags()',
                    docs: 'DOC?',
                    insert: 'get_flags()'
                },
                {
                    label: 'get_iter',
                    detail: 'get_iter(path)',
                    docs: 'DOC?',
                    insert: 'get_iter($1)'
                },
                {
                    label: 'get_iter_first',
                    detail: 'get_iter_first()',
                    docs: 'DOC?',
                    insert: 'get_iter_first()'
                },
                {
                    label: 'get_iter_from_string',
                    detail: 'get_iter_from_string(path_string)',
                    docs: 'DOC?',
                    insert: 'get_iter_from_string($1)'
                },
                {
                    label: 'get_n_columns',
                    detail: 'get_n_columns()',
                    docs: 'DOC?',
                    insert: 'get_n_columns()'
                },
                {
                    label: 'get_path',
                    detail: 'get_path(iter)',
                    docs: 'DOC?',
                    insert: 'get_path($1)'
                },
                {
                    label: 'get_string_from_iter',
                    detail: 'get_string_from_iter(iter)',
                    docs: 'DOC?',
                    insert: 'get_string_from_iter($1)'
                },
                {
                    label: 'get_value',
                    detail: 'get_value(iter, column)',
                    docs: 'DOC?',
                    insert: 'get_value($1)'
                },
                {
                    label: 'iter_children',
                    detail: 'iter_children(parent)',
                    docs: 'DOC?',
                    insert: 'iter_children($1)'
                },
                {
                    label: 'iter_has_child',
                    detail: 'iter_has_child(iter)',
                    docs: 'DOC?',
                    insert: 'iter_has_child($1)'
                },
                {
                    label: 'iter_n_children',
                    detail: 'iter_n_children(iter)',
                    docs: 'DOC?',
                    insert: 'iter_n_children($1)'
                },
                {
                    label: 'iter_next',
                    detail: 'iter_next(aiter)',
                    docs: 'DOC?',
                    insert: 'iter_next($1)'
                },
                {
                    label: 'iter_nth_child',
                    detail: 'iter_nth_child(parent, n)',
                    docs: 'DOC?',
                    insert: 'iter_nth_child($1)'
                },
                {
                    label: 'iter_parent',
                    detail: 'iter_parent(child)',
                    docs: 'DOC?',
                    insert: 'iter_parent($1)'
                },
                {
                    label: 'iter_previous',
                    detail: 'iter_previous(aiter)',
                    docs: 'DOC?',
                    insert: 'iter_previous($1)'
                },
                {
                    label: 'ref_node',
                    detail: 'ref_node(iter)',
                    docs: 'DOC?',
                    insert: 'ref_node($1)'
                },
                {
                    label: 'row_changed',
                    detail: 'row_changed(path, iter)',
                    docs: 'DOC?',
                    insert: 'row_changed($1)'
                },
                {
                    label: 'row_deleted',
                    detail: 'row_deleted(path)',
                    docs: 'DOC?',
                    insert: 'row_deleted($1)'
                },
                {
                    label: 'row_has_child_toggled',
                    detail: 'row_has_child_toggled(path, iter)',
                    docs: 'DOC?',
                    insert: 'row_has_child_toggled($1)'
                },
                {
                    label: 'row_inserted',
                    detail: 'row_inserted(path, iter)',
                    docs: 'DOC?',
                    insert: 'row_inserted($1)'
                },
                {
                    label: 'rows_reordered',
                    detail: 'rows_reordered(path, iter, new_order)',
                    docs: 'DOC?',
                    insert: 'rows_reordered($1)'
                },
                {
                    label: 'set_row',
                    detail: 'set_row(treeiter, row)',
                    docs: 'DOC?',
                    insert: 'set_row($1)'
                },
                {
                    label: 'sort_new_with_model',
                    detail: 'sort_new_with_model()',
                    docs: 'DOC?',
                    insert: 'sort_new_with_model()'
                },
                {
                    label: 'unref_node',
                    detail: 'unref_node(iter)',
                    docs: 'DOC?',
                    insert: 'unref_node($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkTreeSortable = [
                {
                    label: 'get_sort_column_id',
                    detail: 'get_sort_column_id()',
                    docs: 'DOC?',
                    insert: 'get_sort_column_id()'
                },
                {
                    label: 'has_default_sort_func',
                    detail: 'has_default_sort_func()',
                    docs: 'DOC?',
                    insert: 'has_default_sort_func()'
                },
                {
                    label: 'set_default_sort_func',
                    detail: 'set_default_sort_func(sort_func, *user_data)',
                    docs: 'DOC?',
                    insert: 'set_default_sort_func($1)'
                },
                {
                    label: 'set_sort_column_id',
                    detail: 'set_sort_column_id(sort_column_id, order)',
                    docs: 'DOC?',
                    insert: 'set_sort_column_id($1)'
                },
                {
                    label: 'set_sort_func',
                    detail: 'set_sort_func(sort_column_id, sort_func, *user_data)',
                    docs: 'DOC?',
                    insert: 'set_sort_func($1)'
                },
                {
                    label: 'sort_column_changed',
                    detail: 'sort_column_changed()',
                    docs: 'DOC?',
                    insert: 'sort_column_changed()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkListStore = [
                {
                    label: 'new',
                    detail: 'new(types)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'append',
                    detail: 'append(row=None)',
                    docs: 'DOC?',
                    insert: 'append($1)'
                },
                {
                    label: 'clear',
                    detail: 'clear()',
                    docs: 'DOC?',
                    insert: 'clear()'
                },
                {
                    label: 'insert',
                    detail: 'insert(position, row=None)',
                    docs: 'DOC?',
                    insert: 'insert($1)'
                },
                {
                    label: 'insert_after',
                    detail: 'insert_after(sibling, row=None)',
                    docs: 'DOC?',
                    insert: 'insert_after($1)'
                },
                {
                    label: 'insert_before',
                    detail: 'insert_before(sibling, row=None)',
                    docs: 'DOC?',
                    insert: 'insert_before($1)'
                },
                {
                    label: 'insert_with_values',
                    detail: 'insert_with_values(position, columns, values)',
                    docs: 'DOC?',
                    insert: 'insert_with_values($1)'
                },
                {
                    label: 'insert_with_valuesv',
                    detail: 'insert_with_valuesv(position, columns, values)',
                    docs: 'DOC?',
                    insert: 'insert_with_valuesv($1)'
                },
                {
                    label: 'iter_is_valid',
                    detail: 'iter_is_valid(iter)',
                    docs: 'DOC?',
                    insert: 'iter_is_valid($1)'
                },
                {
                    label: 'move_after',
                    detail: 'move_after(iter, position)',
                    docs: 'DOC?',
                    insert: 'move_after($1)'
                },
                {
                    label: 'move_before',
                    detail: 'move_before(iter, position)',
                    docs: 'DOC?',
                    insert: 'move_before($1)'
                },
                {
                    label: 'prepend',
                    detail: 'prepend(row=None)',
                    docs: 'DOC?',
                    insert: 'prepend($1)'
                },
                {
                    label: 'remove',
                    detail: 'remove(iter)',
                    docs: 'DOC?',
                    insert: 'remove($1)'
                },
                {
                    label: 'reorder',
                    detail: 'reorder(new_order)',
                    docs: 'DOC?',
                    insert: 'reorder($1)'
                },
                {
                    label: 'set',
                    detail: 'set(iter, columns, values)',
                    docs: 'DOC?',
                    insert: 'set($1)'
                },
                {
                    label: 'set_column_types',
                    detail: 'set_column_types(types)',
                    docs: 'DOC?',
                    insert: 'set_column_types($1)'
                },
                {
                    label: 'set_value',
                    detail: 'set_value(treeiter, column, value)',
                    docs: 'DOC?',
                    insert: 'set_value($1)'
                },
                {
                    label: 'swap',
                    detail: 'swap(a, b)',
                    docs: 'DOC?',
                    insert: 'swap($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkEntry = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_with_buffer',
                    detail: 'new_with_buffer(buffer)',
                    docs: 'DOC?',
                    insert: 'new_with_buffer($1)'
                },
                {
                    label: 'get_activates_default',
                    detail: 'get_activates_default()',
                    docs: 'DOC?',
                    insert: 'get_activates_default()'
                },
                {
                    label: 'get_alignment',
                    detail: 'get_alignment()',
                    docs: 'DOC?',
                    insert: 'get_alignment()'
                },
                {
                    label: 'get_attributes',
                    detail: 'get_attributes()',
                    docs: 'DOC?',
                    insert: 'get_attributes()'
                },
                {
                    label: 'get_buffer',
                    detail: 'get_buffer()',
                    docs: 'DOC?',
                    insert: 'get_buffer()'
                },
                {
                    label: 'get_completion',
                    detail: 'get_completion()',
                    docs: 'DOC?',
                    insert: 'get_completion()'
                },
                {
                    label: 'get_current_icon_drag_source',
                    detail: 'get_current_icon_drag_source()',
                    docs: 'DOC?',
                    insert: 'get_current_icon_drag_source()'
                },
                {
                    label: 'get_cursor_hadjustment',
                    detail: 'get_cursor_hadjustment()',
                    docs: 'DOC?',
                    insert: 'get_cursor_hadjustment()'
                },
                {
                    label: 'get_has_frame',
                    detail: 'get_has_frame()',
                    docs: 'DOC?',
                    insert: 'get_has_frame()'
                },
                {
                    label: 'get_icon_activatable',
                    detail: 'get_icon_activatable(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_activatable($1)'
                },
                {
                    label: 'get_icon_area',
                    detail: 'get_icon_area(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_area($1)'
                },
                {
                    label: 'get_icon_at_pos',
                    detail: 'get_icon_at_pos(x, y)',
                    docs: 'DOC?',
                    insert: 'get_icon_at_pos($1)'
                },
                {
                    label: 'get_icon_gicon',
                    detail: 'get_icon_gicon(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_gicon($1)'
                },
                {
                    label: 'get_icon_name',
                    detail: 'get_icon_name(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_name($1)'
                },
                {
                    label: 'get_icon_pixbuf',
                    detail: 'get_icon_pixbuf(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_pixbuf($1)'
                },
                {
                    label: 'get_icon_sensitive',
                    detail: 'get_icon_sensitive(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_sensitive($1)'
                },
                {
                    label: 'get_icon_stock',
                    detail: 'get_icon_stock(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_stock($1)'
                },
                {
                    label: 'get_icon_storage_type',
                    detail: 'get_icon_storage_type(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_storage_type($1)'
                },
                {
                    label: 'get_icon_tooltip_markup',
                    detail: 'get_icon_tooltip_markup(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_tooltip_markup($1)'
                },
                {
                    label: 'get_icon_tooltip_text',
                    detail: 'get_icon_tooltip_text(icon_pos)',
                    docs: 'DOC?',
                    insert: 'get_icon_tooltip_text($1)'
                },
                {
                    label: 'get_inner_border',
                    detail: 'get_inner_border()',
                    docs: 'DOC?',
                    insert: 'get_inner_border()'
                },
                {
                    label: 'get_input_hints',
                    detail: 'get_input_hints()',
                    docs: 'DOC?',
                    insert: 'get_input_hints()'
                },
                {
                    label: 'get_input_purpose',
                    detail: 'get_input_purpose()',
                    docs: 'DOC?',
                    insert: 'get_input_purpose()'
                },
                {
                    label: 'get_invisible_char',
                    detail: 'get_invisible_char()',
                    docs: 'DOC?',
                    insert: 'get_invisible_char()'
                },
                {
                    label: 'get_layout',
                    detail: 'get_layout()',
                    docs: 'DOC?',
                    insert: 'get_layout()'
                },
                {
                    label: 'get_layout_offsets',
                    detail: 'get_layout_offsets()',
                    docs: 'DOC?',
                    insert: 'get_layout_offsets()'
                },
                {
                    label: 'get_max_length',
                    detail: 'get_max_length()',
                    docs: 'DOC?',
                    insert: 'get_max_length()'
                },
                {
                    label: 'get_max_width_chars',
                    detail: 'get_max_width_chars()',
                    docs: 'DOC?',
                    insert: 'get_max_width_chars()'
                },
                {
                    label: 'get_overwrite_mode',
                    detail: 'get_overwrite_mode()',
                    docs: 'DOC?',
                    insert: 'get_overwrite_mode()'
                },
                {
                    label: 'get_placeholder_text',
                    detail: 'get_placeholder_text()',
                    docs: 'DOC?',
                    insert: 'get_placeholder_text()'
                },
                {
                    label: 'get_progress_fraction',
                    detail: 'get_progress_fraction()',
                    docs: 'DOC?',
                    insert: 'get_progress_fraction()'
                },
                {
                    label: 'get_progress_pulse_step',
                    detail: 'get_progress_pulse_step()',
                    docs: 'DOC?',
                    insert: 'get_progress_pulse_step()'
                },
                {
                    label: 'get_tabs',
                    detail: 'get_tabs()',
                    docs: 'DOC?',
                    insert: 'get_tabs()'
                },
                {
                    label: 'get_text',
                    detail: 'get_text()',
                    docs: 'DOC?',
                    insert: 'get_text()'
                },
                {
                    label: 'get_text_area',
                    detail: 'get_text_area()',
                    docs: 'DOC?',
                    insert: 'get_text_area()'
                },
                {
                    label: 'get_text_length',
                    detail: 'get_text_length()',
                    docs: 'DOC?',
                    insert: 'get_text_length()'
                },
                {
                    label: 'get_visibility',
                    detail: 'get_visibility()',
                    docs: 'DOC?',
                    insert: 'get_visibility()'
                },
                {
                    label: 'get_width_chars',
                    detail: 'get_width_chars()',
                    docs: 'DOC?',
                    insert: 'get_width_chars()'
                },
                {
                    label: 'grab_focus_without_selecting',
                    detail: 'grab_focus_without_selecting()',
                    docs: 'DOC?',
                    insert: 'grab_focus_without_selecting()'
                },
                {
                    label: 'im_context_filter_keypress',
                    detail: 'im_context_filter_keypress(event)',
                    docs: 'DOC?',
                    insert: 'im_context_filter_keypress($1)'
                },
                {
                    label: 'layout_index_to_text_index',
                    detail: 'layout_index_to_text_index(layout_index)',
                    docs: 'DOC?',
                    insert: 'layout_index_to_text_index($1)'
                },
                {
                    label: 'progress_pulse',
                    detail: 'progress_pulse()',
                    docs: 'DOC?',
                    insert: 'progress_pulse()'
                },
                {
                    label: 'reset_im_context',
                    detail: 'reset_im_context()',
                    docs: 'DOC?',
                    insert: 'reset_im_context()'
                },
                {
                    label: 'set_activates_default',
                    detail: 'set_activates_default(setting)',
                    docs: 'DOC?',
                    insert: 'set_activates_default($1)'
                },
                {
                    label: 'set_alignment',
                    detail: 'set_alignment(xalign)',
                    docs: 'DOC?',
                    insert: 'set_alignment($1)'
                },
                {
                    label: 'set_attributes',
                    detail: 'set_attributes(attrs)',
                    docs: 'DOC?',
                    insert: 'set_attributes($1)'
                },
                {
                    label: 'set_buffer',
                    detail: 'set_buffer(buffer)',
                    docs: 'DOC?',
                    insert: 'set_buffer($1)'
                },
                {
                    label: 'set_completion',
                    detail: 'set_completion(completion)',
                    docs: 'DOC?',
                    insert: 'set_completion($1)'
                },
                {
                    label: 'set_cursor_hadjustment',
                    detail: 'set_cursor_hadjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_cursor_hadjustment($1)'
                },
                {
                    label: 'set_has_frame',
                    detail: 'set_has_frame(setting)',
                    docs: 'DOC?',
                    insert: 'set_has_frame($1)'
                },
                {
                    label: 'set_icon_activatable',
                    detail: 'set_icon_activatable(icon_pos, activatable)',
                    docs: 'DOC?',
                    insert: 'set_icon_activatable($1)'
                },
                {
                    label: 'set_icon_drag_source',
                    detail: 'set_icon_drag_source(icon_pos, target_list, actions)',
                    docs: 'DOC?',
                    insert: 'set_icon_drag_source($1)'
                },
                {
                    label: 'set_icon_from_gicon',
                    detail: 'set_icon_from_gicon(icon_pos, icon)',
                    docs: 'DOC?',
                    insert: 'set_icon_from_gicon($1)'
                },
                {
                    label: 'set_icon_from_icon_name',
                    detail: 'set_icon_from_icon_name(icon_pos, icon_name)',
                    docs: 'DOC?',
                    insert: 'set_icon_from_icon_name($1)'
                },
                {
                    label: 'set_icon_from_pixbuf',
                    detail: 'set_icon_from_pixbuf(icon_pos, pixbuf)',
                    docs: 'DOC?',
                    insert: 'set_icon_from_pixbuf($1)'
                },
                {
                    label: 'set_icon_from_stock',
                    detail: 'set_icon_from_stock(icon_pos, stock_id)',
                    docs: 'DOC?',
                    insert: 'set_icon_from_stock($1)'
                },
                {
                    label: 'set_icon_sensitive',
                    detail: 'set_icon_sensitive(icon_pos, sensitive)',
                    docs: 'DOC?',
                    insert: 'set_icon_sensitive($1)'
                },
                {
                    label: 'set_icon_tooltip_markup',
                    detail: 'set_icon_tooltip_markup(icon_pos, tooltip)',
                    docs: 'DOC?',
                    insert: 'set_icon_tooltip_markup($1)'
                },
                {
                    label: 'set_icon_tooltip_text',
                    detail: 'set_icon_tooltip_text(icon_pos, tooltip)',
                    docs: 'DOC?',
                    insert: 'set_icon_tooltip_text($1)'
                },
                {
                    label: 'set_inner_border',
                    detail: 'set_inner_border(border)',
                    docs: 'DOC?',
                    insert: 'set_inner_border($1)'
                },
                {
                    label: 'set_input_hints',
                    detail: 'set_input_hints(hints)',
                    docs: 'DOC?',
                    insert: 'set_input_hints($1)'
                },
                {
                    label: 'set_input_purpose',
                    detail: 'set_input_purpose(purpose)',
                    docs: 'DOC?',
                    insert: 'set_input_purpose($1)'
                },
                {
                    label: 'set_invisible_char',
                    detail: 'set_invisible_char(ch)',
                    docs: 'DOC?',
                    insert: 'set_invisible_char($1)'
                },
                {
                    label: 'set_max_length',
                    detail: 'set_max_length(max)',
                    docs: 'DOC?',
                    insert: 'set_max_length($1)'
                },
                {
                    label: 'set_max_width_chars',
                    detail: 'set_max_width_chars(n_chars)',
                    docs: 'DOC?',
                    insert: 'set_max_width_chars($1)'
                },
                {
                    label: 'set_overwrite_mode',
                    detail: 'set_overwrite_mode(overwrite)',
                    docs: 'DOC?',
                    insert: 'set_overwrite_mode($1)'
                },
                {
                    label: 'set_placeholder_text',
                    detail: 'set_placeholder_text(text)',
                    docs: 'DOC?',
                    insert: 'set_placeholder_text($1)'
                },
                {
                    label: 'set_progress_fraction',
                    detail: 'set_progress_fraction(fraction)',
                    docs: 'DOC?',
                    insert: 'set_progress_fraction($1)'
                },
                {
                    label: 'set_progress_pulse_step',
                    detail: 'set_progress_pulse_step(fraction)',
                    docs: 'DOC?',
                    insert: 'set_progress_pulse_step($1)'
                },
                {
                    label: 'set_tabs',
                    detail: 'set_tabs(tabs)',
                    docs: 'DOC?',
                    insert: 'set_tabs($1)'
                },
                {
                    label: 'set_text',
                    detail: 'set_text(text)',
                    docs: 'DOC?',
                    insert: 'set_text($1)'
                },
                {
                    label: 'set_visibility',
                    detail: 'set_visibility(visible)',
                    docs: 'DOC?',
                    insert: 'set_visibility($1)'
                },
                {
                    label: 'set_width_chars',
                    detail: 'set_width_chars(n_chars)',
                    docs: 'DOC?',
                    insert: 'set_width_chars($1)'
                },
                {
                    label: 'text_index_to_layout_index',
                    detail: 'text_index_to_layout_index(text_index)',
                    docs: 'DOC?',
                    insert: 'text_index_to_layout_index($1)'
                },
                {
                    label: 'unset_invisible_char',
                    detail: 'unset_invisible_char()',
                    docs: 'DOC?',
                    insert: 'unset_invisible_char()'
                },
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkEditable = [
                {
                    label: 'copy_clipboard',
                    detail: 'copy_clipboard()',
                    docs: 'DOC?',
                    insert: 'copy_clipboard()'
                },
                {
                    label: 'cut_clipboard',
                    detail: 'cut_clipboard()',
                    docs: 'DOC?',
                    insert: 'cut_clipboard()'
                },
                {
                    label: 'delete_selection',
                    detail: 'delete_selection()',
                    docs: 'DOC?',
                    insert: 'delete_selection()'
                },
                {
                    label: 'delete_text',
                    detail: 'delete_text(start_pos, end_pos)',
                    docs: 'DOC?',
                    insert: 'delete_text($1)'
                },
                {
                    label: 'get_chars',
                    detail: 'get_chars(start_pos, end_pos)',
                    docs: 'DOC?',
                    insert: 'get_chars($1)'
                },
                {
                    label: 'get_editable',
                    detail: 'get_editable()',
                    docs: 'DOC?',
                    insert: 'get_editable()'
                },
                {
                    label: 'get_position',
                    detail: 'get_position()',
                    docs: 'DOC?',
                    insert: 'get_position()'
                },
                {
                    label: 'get_selection_bounds',
                    detail: 'get_selection_bounds()',
                    docs: 'DOC?',
                    insert: 'get_selection_bounds()'
                },
                {
                    label: 'insert_text',
                    detail: 'insert_text(self, text, position)',
                    docs: 'DOC?',
                    insert: 'insert_text($1)'
                },
                {
                    label: 'paste_clipboard',
                    detail: 'paste_clipboard()',
                    docs: 'DOC?',
                    insert: 'paste_clipboard()'
                },
                {
                    label: 'select_region',
                    detail: 'select_region(start_pos, end_pos)',
                    docs: 'DOC?',
                    insert: 'select_region($1)'
                },
                {
                    label: 'set_editable',
                    detail: 'set_editable(is_editable)',
                    docs: 'DOC?',
                    insert: 'set_editable($1)'
                },
                {
                    label: 'set_position',
                    detail: 'set_position(position)',
                    docs: 'DOC?',
                    insert: 'set_position($1)'
                },
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkFileChooserButton = [
                {
                    label: 'new',
                    detail: 'new(title, action)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'new_with_dialog',
                    detail: 'new_with_dialog(dialog)',
                    docs: 'DOC?',
                    insert: 'new_with_dialog($1)'
                },
                {
                    label: 'get_focus_on_click',
                    detail: 'get_focus_on_click()',
                    docs: 'DOC?',
                    insert: 'get_focus_on_click()'
                },
                {
                    label: 'get_title',
                    detail: 'get_title()',
                    docs: 'DOC?',
                    insert: 'get_title()'
                },
                {
                    label: 'get_width_chars',
                    detail: 'get_width_chars()',
                    docs: 'DOC?',
                    insert: 'get_width_chars()'
                },
                {
                    label: 'set_focus_on_click',
                    detail: 'set_focus_on_click(focus_on_click)',
                    docs: 'DOC?',
                    insert: 'set_focus_on_click($1)'
                },
                {
                    label: 'set_title',
                    detail: 'set_title(title)',
                    docs: 'DOC?',
                    insert: 'set_title($1)'
                },
                {
                    label: 'set_width_chars',
                    detail: 'set_width_chars(n_chars)',
                    docs: 'DOC?',
                    insert: 'set_width_chars($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkOrientable = [
                {
                    label: 'get_orientation',
                    detail: 'get_orientation()',
                    docs: 'DOC?',
                    insert: 'get_orientation()'
                },
                {
                    label: 'set_orientation',
                    detail: 'set_orientation(orientation)',
                    docs: 'DOC?',
                    insert: 'set_orientation($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkFileChooser = [
                {
                    label: 'add_choice',
                    detail: 'add_choice(id, label, options, option_labels)',
                    docs: 'DOC?',
                    insert: 'add_choice($1)'
                },
                {
                    label: 'add_filter',
                    detail: 'add_filter(filter)',
                    docs: 'DOC?',
                    insert: 'add_filter($1)'
                },
                {
                    label: 'add_shortcut_folder',
                    detail: 'add_shortcut_folder(folder)',
                    docs: 'DOC?',
                    insert: 'add_shortcut_folder($1)'
                },
                {
                    label: 'add_shortcut_folder_uri',
                    detail: 'add_shortcut_folder_uri(uri)',
                    docs: 'DOC?',
                    insert: 'add_shortcut_folder_uri($1)'
                },
                {
                    label: 'get_action',
                    detail: 'get_action()',
                    docs: 'DOC?',
                    insert: 'get_action()'
                },
                {
                    label: 'get_choice',
                    detail: 'get_choice(id)',
                    docs: 'DOC?',
                    insert: 'get_choice($1)'
                },
                {
                    label: 'get_create_folders',
                    detail: 'get_create_folders()',
                    docs: 'DOC?',
                    insert: 'get_create_folders()'
                },
                {
                    label: 'get_current_folder',
                    detail: 'get_current_folder()',
                    docs: 'DOC?',
                    insert: 'get_current_folder()'
                },
                {
                    label: 'get_current_folder_file',
                    detail: 'get_current_folder_file()',
                    docs: 'DOC?',
                    insert: 'get_current_folder_file()'
                },
                {
                    label: 'get_current_folder_uri',
                    detail: 'get_current_folder_uri()',
                    docs: 'DOC?',
                    insert: 'get_current_folder_uri()'
                },
                {
                    label: 'get_current_name',
                    detail: 'get_current_name()',
                    docs: 'DOC?',
                    insert: 'get_current_name()'
                },
                {
                    label: 'get_do_overwrite_confirmation',
                    detail: 'get_do_overwrite_confirmation()',
                    docs: 'DOC?',
                    insert: 'get_do_overwrite_confirmation()'
                },
                {
                    label: 'get_extra_widget',
                    detail: 'get_extra_widget()',
                    docs: 'DOC?',
                    insert: 'get_extra_widget()'
                },
                {
                    label: 'get_file',
                    detail: 'get_file()',
                    docs: 'DOC?',
                    insert: 'get_file()'
                },
                {
                    label: 'get_filename',
                    detail: 'get_filename()',
                    docs: 'DOC?',
                    insert: 'get_filename()'
                },
                {
                    label: 'get_filenames',
                    detail: 'get_filenames()',
                    docs: 'DOC?',
                    insert: 'get_filenames()'
                },
                {
                    label: 'get_files',
                    detail: 'get_files()',
                    docs: 'DOC?',
                    insert: 'get_files()'
                },
                {
                    label: 'get_filter',
                    detail: 'get_filter()',
                    docs: 'DOC?',
                    insert: 'get_filter()'
                },
                {
                    label: 'get_local_only',
                    detail: 'get_local_only()',
                    docs: 'DOC?',
                    insert: 'get_local_only()'
                },
                {
                    label: 'get_preview_file',
                    detail: 'get_preview_file()',
                    docs: 'DOC?',
                    insert: 'get_preview_file()'
                },
                {
                    label: 'get_preview_filename',
                    detail: 'get_preview_filename()',
                    docs: 'DOC?',
                    insert: 'get_preview_filename()'
                },
                {
                    label: 'get_preview_uri',
                    detail: 'get_preview_uri()',
                    docs: 'DOC?',
                    insert: 'get_preview_uri()'
                },
                {
                    label: 'get_preview_widget',
                    detail: 'get_preview_widget()',
                    docs: 'DOC?',
                    insert: 'get_preview_widget()'
                },
                {
                    label: 'get_preview_widget_active',
                    detail: 'get_preview_widget_active()',
                    docs: 'DOC?',
                    insert: 'get_preview_widget_active()'
                },
                {
                    label: 'get_select_multiple',
                    detail: 'get_select_multiple()',
                    docs: 'DOC?',
                    insert: 'get_select_multiple()'
                },
                {
                    label: 'get_show_hidden',
                    detail: 'get_show_hidden()',
                    docs: 'DOC?',
                    insert: 'get_show_hidden()'
                },
                {
                    label: 'get_uri',
                    detail: 'get_uri()',
                    docs: 'DOC?',
                    insert: 'get_uri()'
                },
                {
                    label: 'get_uris',
                    detail: 'get_uris()',
                    docs: 'DOC?',
                    insert: 'get_uris()'
                },
                {
                    label: 'get_use_preview_label',
                    detail: 'get_use_preview_label()',
                    docs: 'DOC?',
                    insert: 'get_use_preview_label()'
                },
                {
                    label: 'list_filters',
                    detail: 'list_filters()',
                    docs: 'DOC?',
                    insert: 'list_filters()'
                },
                {
                    label: 'list_shortcut_folder_uris',
                    detail: 'list_shortcut_folder_uris()',
                    docs: 'DOC?',
                    insert: 'list_shortcut_folder_uris()'
                },
                {
                    label: 'list_shortcut_folders',
                    detail: 'list_shortcut_folders()',
                    docs: 'DOC?',
                    insert: 'list_shortcut_folders()'
                },
                {
                    label: 'remove_choice',
                    detail: 'remove_choice(id)',
                    docs: 'DOC?',
                    insert: 'remove_choice($1)'
                },
                {
                    label: 'remove_filter',
                    detail: 'remove_filter(filter)',
                    docs: 'DOC?',
                    insert: 'remove_filter($1)'
                },
                {
                    label: 'remove_shortcut_folder',
                    detail: 'remove_shortcut_folder(folder)',
                    docs: 'DOC?',
                    insert: 'remove_shortcut_folder($1)'
                },
                {
                    label: 'remove_shortcut_folder_uri',
                    detail: 'remove_shortcut_folder_uri(uri)',
                    docs: 'DOC?',
                    insert: 'remove_shortcut_folder_uri($1)'
                },
                {
                    label: 'select_all',
                    detail: 'select_all()',
                    docs: 'DOC?',
                    insert: 'select_all()'
                },
                {
                    label: 'select_file',
                    detail: 'select_file(file)',
                    docs: 'DOC?',
                    insert: 'select_file($1)'
                },
                {
                    label: 'select_filename',
                    detail: 'select_filename(filename)',
                    docs: 'DOC?',
                    insert: 'select_filename($1)'
                },
                {
                    label: 'select_uri',
                    detail: 'select_uri(uri)',
                    docs: 'DOC?',
                    insert: 'select_uri($1)'
                },
                {
                    label: 'set_action',
                    detail: 'set_action(action)',
                    docs: 'DOC?',
                    insert: 'set_action($1)'
                },
                {
                    label: 'set_choice',
                    detail: 'set_choice(id, option)',
                    docs: 'DOC?',
                    insert: 'set_choice($1)'
                },
                {
                    label: 'set_create_folders',
                    detail: 'set_create_folders(create_folders)',
                    docs: 'DOC?',
                    insert: 'set_create_folders($1)'
                },
                {
                    label: 'set_current_folder',
                    detail: 'set_current_folder(filename)',
                    docs: 'DOC?',
                    insert: 'set_current_folder($1)'
                },
                {
                    label: 'set_current_folder_file',
                    detail: 'set_current_folder_file(file)',
                    docs: 'DOC?',
                    insert: 'set_current_folder_file($1)'
                },
                {
                    label: 'set_current_folder_uri',
                    detail: 'set_current_folder_uri(uri)',
                    docs: 'DOC?',
                    insert: 'set_current_folder_uri($1)'
                },
                {
                    label: 'set_current_name',
                    detail: 'set_current_name(name)',
                    docs: 'DOC?',
                    insert: 'set_current_name($1)'
                },
                {
                    label: 'set_do_overwrite_confirmation',
                    detail: 'set_do_overwrite_confirmation(do_overwrite_confirmation)',
                    docs: 'DOC?',
                    insert: 'set_do_overwrite_confirmation($1)'
                },
                {
                    label: 'set_extra_widget',
                    detail: 'set_extra_widget(extra_widget)',
                    docs: 'DOC?',
                    insert: 'set_extra_widget($1)'
                },
                {
                    label: 'set_file',
                    detail: 'set_file(file)',
                    docs: 'DOC?',
                    insert: 'set_file($1)'
                },
                {
                    label: 'set_filename',
                    detail: 'set_filename(filename)',
                    docs: 'DOC?',
                    insert: 'set_filename($1)'
                },
                {
                    label: 'set_filter',
                    detail: 'set_filter(filter)',
                    docs: 'DOC?',
                    insert: 'set_filter($1)'
                },
                {
                    label: 'set_local_only',
                    detail: 'set_local_only(local_only)',
                    docs: 'DOC?',
                    insert: 'set_local_only($1)'
                },
                {
                    label: 'set_preview_widget',
                    detail: 'set_preview_widget(preview_widget)',
                    docs: 'DOC?',
                    insert: 'set_preview_widget($1)'
                },
                {
                    label: 'set_preview_widget_active',
                    detail: 'set_preview_widget_active(active)',
                    docs: 'DOC?',
                    insert: 'set_preview_widget_active($1)'
                },
                {
                    label: 'set_select_multiple',
                    detail: 'set_select_multiple(select_multiple)',
                    docs: 'DOC?',
                    insert: 'set_select_multiple($1)'
                },
                {
                    label: 'set_show_hidden',
                    detail: 'set_show_hidden(show_hidden)',
                    docs: 'DOC?',
                    insert: 'set_show_hidden($1)'
                },
                {
                    label: 'set_uri',
                    detail: 'set_uri(uri)',
                    docs: 'DOC?',
                    insert: 'set_uri($1)'
                },
                {
                    label: 'set_use_preview_label',
                    detail: 'set_use_preview_label(use_label)',
                    docs: 'DOC?',
                    insert: 'set_use_preview_label($1)'
                },
                {
                    label: 'unselect_all',
                    detail: 'unselect_all()',
                    docs: 'DOC?',
                    insert: 'unselect_all()'
                },
                {
                    label: 'unselect_file',
                    detail: 'unselect_file(file)',
                    docs: 'DOC?',
                    insert: 'unselect_file($1)'
                },
                {
                    label: 'unselect_filename',
                    detail: 'unselect_filename(filename)',
                    docs: 'DOC?',
                    insert: 'unselect_filename($1)'
                },
                {
                    label: 'unselect_uri',
                    detail: 'unselect_uri(uri)',
                    docs: 'DOC?',
                    insert: 'unselect_uri($1)'
                },
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkBox = [
                {
                    label: 'new',
                    detail: 'new(orientation, spacing)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'get_baseline_position',
                    detail: 'get_baseline_position()',
                    docs: 'DOC?',
                    insert: 'get_baseline_position()'
                },
                {
                    label: 'get_center_widget',
                    detail: 'get_center_widget()',
                    docs: 'DOC?',
                    insert: 'get_center_widget()'
                },
                {
                    label: 'get_homogeneous',
                    detail: 'get_homogeneous()',
                    docs: 'DOC?',
                    insert: 'get_homogeneous()'
                },
                {
                    label: 'get_spacing',
                    detail: 'get_spacing()',
                    docs: 'DOC?',
                    insert: 'get_spacing()'
                },
                {
                    label: 'pack_end',
                    detail: 'pack_end(child, expand, fill, padding)',
                    docs: 'DOC?',
                    insert: 'pack_end($1)'
                },
                {
                    label: 'pack_start',
                    detail: 'pack_start(child, expand, fill, padding)',
                    docs: 'DOC?',
                    insert: 'pack_start($1)'
                },
                {
                    label: 'query_child_packing',
                    detail: 'query_child_packing(child)',
                    docs: 'DOC?',
                    insert: 'query_child_packing($1)'
                },
                {
                    label: 'reorder_child',
                    detail: 'reorder_child(child, position)',
                    docs: 'DOC?',
                    insert: 'reorder_child($1)'
                },
                {
                    label: 'set_baseline_position',
                    detail: 'set_baseline_position(position)',
                    docs: 'DOC?',
                    insert: 'set_baseline_position($1)'
                },
                {
                    label: 'set_center_widget',
                    detail: 'set_center_widget(widget)',
                    docs: 'DOC?',
                    insert: 'set_center_widget($1)'
                },
                {
                    label: 'set_child_packing',
                    detail: 'set_child_packing(child, expand, fill, padding, pack_type)',
                    docs: 'DOC?',
                    insert: 'set_child_packing($1)'
                },
                {
                    label: 'set_homogeneous',
                    detail: 'set_homogeneous(homogeneous)',
                    docs: 'DOC?',
                    insert: 'set_homogeneous($1)'
                },
                {
                    label: 'set_spacing',
                    detail: 'set_spacing(spacing)',
                    docs: 'DOC?',
                    insert: 'set_spacing($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkFlowBox = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'bind_model',
                    detail: 'bind_model(model, create_widget_func, *user_data)',
                    docs: 'DOC?',
                    insert: 'bind_model($1)'
                },
                {
                    label: 'get_activate_on_single_click',
                    detail: 'get_activate_on_single_click()',
                    docs: 'DOC?',
                    insert: 'get_activate_on_single_click()'
                },
                {
                    label: 'get_child_at_index',
                    detail: 'get_child_at_index(idx)',
                    docs: 'DOC?',
                    insert: 'get_child_at_index($1)'
                },
                {
                    label: 'get_child_at_pos',
                    detail: 'get_child_at_pos(x, y)',
                    docs: 'DOC?',
                    insert: 'get_child_at_pos($1)'
                },
                {
                    label: 'get_column_spacing',
                    detail: 'get_column_spacing()',
                    docs: 'DOC?',
                    insert: 'get_column_spacing()'
                },
                {
                    label: 'get_homogeneous',
                    detail: 'get_homogeneous()',
                    docs: 'DOC?',
                    insert: 'get_homogeneous()'
                },
                {
                    label: 'get_max_children_per_line',
                    detail: 'get_max_children_per_line()',
                    docs: 'DOC?',
                    insert: 'get_max_children_per_line()'
                },
                {
                    label: 'get_min_children_per_line',
                    detail: 'get_min_children_per_line()',
                    docs: 'DOC?',
                    insert: 'get_min_children_per_line()'
                },
                {
                    label: 'get_row_spacing',
                    detail: 'get_row_spacing()',
                    docs: 'DOC?',
                    insert: 'get_row_spacing()'
                },
                {
                    label: 'get_selected_children',
                    detail: 'get_selected_children()',
                    docs: 'DOC?',
                    insert: 'get_selected_children()'
                },
                {
                    label: 'get_selection_mode',
                    detail: 'get_selection_mode()',
                    docs: 'DOC?',
                    insert: 'get_selection_mode()'
                },
                {
                    label: 'insert',
                    detail: 'insert(widget, position)',
                    docs: 'DOC?',
                    insert: 'insert($1)'
                },
                {
                    label: 'invalidate_filter',
                    detail: 'invalidate_filter()',
                    docs: 'DOC?',
                    insert: 'invalidate_filter()'
                },
                {
                    label: 'invalidate_sort',
                    detail: 'invalidate_sort()',
                    docs: 'DOC?',
                    insert: 'invalidate_sort()'
                },
                {
                    label: 'select_all',
                    detail: 'select_all()',
                    docs: 'DOC?',
                    insert: 'select_all()'
                },
                {
                    label: 'select_child',
                    detail: 'select_child(child)',
                    docs: 'DOC?',
                    insert: 'select_child($1)'
                },
                {
                    label: 'selected_foreach',
                    detail: 'selected_foreach(func, *data)',
                    docs: 'DOC?',
                    insert: 'selected_foreach($1)'
                },
                {
                    label: 'set_activate_on_single_click',
                    detail: 'set_activate_on_single_click(single)',
                    docs: 'DOC?',
                    insert: 'set_activate_on_single_click($1)'
                },
                {
                    label: 'set_column_spacing',
                    detail: 'set_column_spacing(spacing)',
                    docs: 'DOC?',
                    insert: 'set_column_spacing($1)'
                },
                {
                    label: 'set_filter_func',
                    detail: 'set_filter_func(filter_func, *user_data)',
                    docs: 'DOC?',
                    insert: 'set_filter_func($1)'
                },
                {
                    label: 'set_hadjustment',
                    detail: 'set_hadjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_hadjustment($1)'
                },
                {
                    label: 'set_homogeneous',
                    detail: 'set_homogeneous(homogeneous)',
                    docs: 'DOC?',
                    insert: 'set_homogeneous($1)'
                },
                {
                    label: 'set_max_children_per_line',
                    detail: 'set_max_children_per_line(n_children)',
                    docs: 'DOC?',
                    insert: 'set_max_children_per_line($1)'
                },
                {
                    label: 'set_min_children_per_line',
                    detail: 'set_min_children_per_line(n_children)',
                    docs: 'DOC?',
                    insert: 'set_min_children_per_line($1)'
                },
                {
                    label: 'set_row_spacing',
                    detail: 'set_row_spacing(spacing)',
                    docs: 'DOC?',
                    insert: 'set_row_spacing($1)'
                },
                {
                    label: 'set_selection_mode',
                    detail: 'set_selection_mode(mode)',
                    docs: 'DOC?',
                    insert: 'set_selection_mode($1)'
                },
                {
                    label: 'set_sort_func',
                    detail: 'set_sort_func(sort_func, *user_data)',
                    docs: 'DOC?',
                    insert: 'set_sort_func($1)'
                },
                {
                    label: 'set_vadjustment',
                    detail: 'set_vadjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_vadjustment($1)'
                },
                {
                    label: 'unselect_all',
                    detail: 'unselect_all()',
                    docs: 'DOC?',
                    insert: 'unselect_all()'
                },
                {
                    label: 'unselect_child',
                    detail: 'unselect_child(child)',
                    docs: 'DOC?',
                    insert: 'unselect_child($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkFontButton = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_with_font',
                    detail: 'new_with_font(fontname)',
                    docs: 'DOC?',
                    insert: 'new_with_font($1)'
                },
                {
                    label: 'get_font_name',
                    detail: 'get_font_name()',
                    docs: 'DOC?',
                    insert: 'get_font_name()'
                },
                {
                    label: 'get_show_size',
                    detail: 'get_show_size()',
                    docs: 'DOC?',
                    insert: 'get_show_size()'
                },
                {
                    label: 'get_show_style',
                    detail: 'get_show_style()',
                    docs: 'DOC?',
                    insert: 'get_show_style()'
                },
                {
                    label: 'get_title',
                    detail: 'get_title()',
                    docs: 'DOC?',
                    insert: 'get_title()'
                },
                {
                    label: 'get_use_font',
                    detail: 'get_use_font()',
                    docs: 'DOC?',
                    insert: 'get_use_font()'
                },
                {
                    label: 'get_use_size',
                    detail: 'get_use_size()',
                    docs: 'DOC?',
                    insert: 'get_use_size()'
                },
                {
                    label: 'set_font_name',
                    detail: 'set_font_name(fontname)',
                    docs: 'DOC?',
                    insert: 'set_font_name($1)'
                },
                {
                    label: 'set_show_size',
                    detail: 'set_show_size(show_size)',
                    docs: 'DOC?',
                    insert: 'set_show_size($1)'
                },
                {
                    label: 'set_show_style',
                    detail: 'set_show_style(show_style)',
                    docs: 'DOC?',
                    insert: 'set_show_style($1)'
                },
                {
                    label: 'set_title',
                    detail: 'set_title(title)',
                    docs: 'DOC?',
                    insert: 'set_title($1)'
                },
                {
                    label: 'set_use_font',
                    detail: 'set_use_font(use_font)',
                    docs: 'DOC?',
                    insert: 'set_use_font($1)'
                },
                {
                    label: 'set_use_size',
                    detail: 'set_use_size(use_size)',
                    docs: 'DOC?',
                    insert: 'set_use_size($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkFontChooser = [
                {
                    label: 'get_font',
                    detail: 'get_font()',
                    docs: 'DOC?',
                    insert: 'get_font()'
                },
                {
                    label: 'get_font_desc',
                    detail: 'get_font_desc()',
                    docs: 'DOC?',
                    insert: 'get_font_desc()'
                },
                {
                    label: 'get_font_face',
                    detail: 'get_font_face()',
                    docs: 'DOC?',
                    insert: 'get_font_face()'
                },
                {
                    label: 'get_font_family',
                    detail: 'get_font_family()',
                    docs: 'DOC?',
                    insert: 'get_font_family()'
                },
                {
                    label: 'get_font_features',
                    detail: 'get_font_features()',
                    docs: 'DOC?',
                    insert: 'get_font_features()'
                },
                {
                    label: 'get_font_map',
                    detail: 'get_font_map()',
                    docs: 'DOC?',
                    insert: 'get_font_map()'
                },
                {
                    label: 'get_font_size',
                    detail: 'get_font_size()',
                    docs: 'DOC?',
                    insert: 'get_font_size()'
                },
                {
                    label: 'get_language',
                    detail: 'get_language()',
                    docs: 'DOC?',
                    insert: 'get_language()'
                },
                {
                    label: 'get_level',
                    detail: 'get_level()',
                    docs: 'DOC?',
                    insert: 'get_level()'
                },
                {
                    label: 'get_preview_text',
                    detail: 'get_preview_text()',
                    docs: 'DOC?',
                    insert: 'get_preview_text()'
                },
                {
                    label: 'get_show_preview_entry',
                    detail: 'get_show_preview_entry()',
                    docs: 'DOC?',
                    insert: 'get_show_preview_entry()'
                },
                {
                    label: 'set_filter_func',
                    detail: 'set_filter_func(filter, *user_data)',
                    docs: 'DOC?',
                    insert: 'set_filter_func($1)'
                },
                {
                    label: 'set_font',
                    detail: 'set_font(fontname)',
                    docs: 'DOC?',
                    insert: 'set_font($1)'
                },
                {
                    label: 'set_font_desc',
                    detail: 'set_font_desc(font_desc)',
                    docs: 'DOC?',
                    insert: 'set_font_desc($1)'
                },
                {
                    label: 'set_font_map',
                    detail: 'set_font_map(fontmap)',
                    docs: 'DOC?',
                    insert: 'set_font_map($1)'
                },
                {
                    label: 'set_language',
                    detail: 'set_language(language)',
                    docs: 'DOC?',
                    insert: 'set_language($1)'
                },
                {
                    label: 'set_level',
                    detail: 'set_level(level)',
                    docs: 'DOC?',
                    insert: 'set_level($1)'
                },
                {
                    label: 'set_preview_text',
                    detail: 'set_preview_text(text)',
                    docs: 'DOC?',
                    insert: 'set_preview_text($1)'
                },
                {
                    label: 'set_show_preview_entry',
                    detail: 'set_show_preview_entry(show_preview_entry)',
                    docs: 'DOC?',
                    insert: 'set_show_preview_entry($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkFrame = [
                {
                    label: 'new',
                    detail: 'new(label)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'get_label',
                    detail: 'get_label()',
                    docs: 'DOC?',
                    insert: 'get_label()'
                },
                {
                    label: 'get_label_align',
                    detail: 'get_label_align()',
                    docs: 'DOC?',
                    insert: 'get_label_align()'
                },
                {
                    label: 'get_label_widget',
                    detail: 'get_label_widget()',
                    docs: 'DOC?',
                    insert: 'get_label_widget()'
                },
                {
                    label: 'get_shadow_type',
                    detail: 'get_shadow_type()',
                    docs: 'DOC?',
                    insert: 'get_shadow_type()'
                },
                {
                    label: 'set_label',
                    detail: 'set_label(label)',
                    docs: 'DOC?',
                    insert: 'set_label($1)'
                },
                {
                    label: 'set_label_align',
                    detail: 'set_label_align(xalign, yalign)',
                    docs: 'DOC?',
                    insert: 'set_label_align($1)'
                },
                {
                    label: 'set_label_widget',
                    detail: 'set_label_widget(label_widget)',
                    docs: 'DOC?',
                    insert: 'set_label_widget($1)'
                },
                {
                    label: 'set_shadow_type',
                    detail: 'set_shadow_type(type)',
                    docs: 'DOC?',
                    insert: 'set_shadow_type($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkGLArea = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'attach_buffers',
                    detail: 'attach_buffers()',
                    docs: 'DOC?',
                    insert: 'attach_buffers()'
                },
                {
                    label: 'get_auto_render',
                    detail: 'get_auto_render()',
                    docs: 'DOC?',
                    insert: 'get_auto_render()'
                },
                {
                    label: 'get_context',
                    detail: 'get_context()',
                    docs: 'DOC?',
                    insert: 'get_context()'
                },
                {
                    label: 'get_error',
                    detail: 'get_error()',
                    docs: 'DOC?',
                    insert: 'get_error()'
                },
                {
                    label: 'get_has_alpha',
                    detail: 'get_has_alpha()',
                    docs: 'DOC?',
                    insert: 'get_has_alpha()'
                },
                {
                    label: 'get_has_depth_buffer',
                    detail: 'get_has_depth_buffer()',
                    docs: 'DOC?',
                    insert: 'get_has_depth_buffer()'
                },
                {
                    label: 'get_has_stencil_buffer',
                    detail: 'get_has_stencil_buffer()',
                    docs: 'DOC?',
                    insert: 'get_has_stencil_buffer()'
                },
                {
                    label: 'get_required_version',
                    detail: 'get_required_version()',
                    docs: 'DOC?',
                    insert: 'get_required_version()'
                },
                {
                    label: 'get_use_es',
                    detail: 'get_use_es()',
                    docs: 'DOC?',
                    insert: 'get_use_es()'
                },
                {
                    label: 'make_current',
                    detail: 'make_current()',
                    docs: 'DOC?',
                    insert: 'make_current()'
                },
                {
                    label: 'queue_render',
                    detail: 'queue_render()',
                    docs: 'DOC?',
                    insert: 'queue_render()'
                },
                {
                    label: 'set_auto_render',
                    detail: 'set_auto_render(auto_render)',
                    docs: 'DOC?',
                    insert: 'set_auto_render($1)'
                },
                {
                    label: 'set_error',
                    detail: 'set_error(error)',
                    docs: 'DOC?',
                    insert: 'set_error($1)'
                },
                {
                    label: 'set_has_alpha',
                    detail: 'set_has_alpha(has_alpha)',
                    docs: 'DOC?',
                    insert: 'set_has_alpha($1)'
                },
                {
                    label: 'set_has_depth_buffer',
                    detail: 'set_has_depth_buffer(has_depth_buffer)',
                    docs: 'DOC?',
                    insert: 'set_has_depth_buffer($1)'
                },
                {
                    label: 'set_has_stencil_buffer',
                    detail: 'set_has_stencil_buffer(has_stencil_buffer)',
                    docs: 'DOC?',
                    insert: 'set_has_stencil_buffer($1)'
                },
                {
                    label: 'set_required_version',
                    detail: 'set_required_version(major, minor)',
                    docs: 'DOC?',
                    insert: 'set_required_version($1)'
                },
                {
                    label: 'set_use_es',
                    detail: 'set_use_es(use_es)',
                    docs: 'DOC?',
                    insert: 'set_use_es($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkGrid = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'attach',
                    detail: 'attach(child, left, top, width, height)',
                    docs: 'DOC?',
                    insert: 'attach($1)'
                },
                {
                    label: 'attach_next_to',
                    detail: 'attach_next_to(child, sibling, side, width, height)',
                    docs: 'DOC?',
                    insert: 'attach_next_to($1)'
                },
                {
                    label: 'get_baseline_row',
                    detail: 'get_baseline_row()',
                    docs: 'DOC?',
                    insert: 'get_baseline_row()'
                },
                {
                    label: 'get_child_at',
                    detail: 'get_child_at(left, top)',
                    docs: 'DOC?',
                    insert: 'get_child_at($1)'
                },
                {
                    label: 'get_column_homogeneous',
                    detail: 'get_column_homogeneous()',
                    docs: 'DOC?',
                    insert: 'get_column_homogeneous()'
                },
                {
                    label: 'get_column_spacing',
                    detail: 'get_column_spacing()',
                    docs: 'DOC?',
                    insert: 'get_column_spacing()'
                },
                {
                    label: 'get_row_baseline_position',
                    detail: 'get_row_baseline_position(row)',
                    docs: 'DOC?',
                    insert: 'get_row_baseline_position($1)'
                },
                {
                    label: 'get_row_homogeneous',
                    detail: 'get_row_homogeneous()',
                    docs: 'DOC?',
                    insert: 'get_row_homogeneous()'
                },
                {
                    label: 'get_row_spacing',
                    detail: 'get_row_spacing()',
                    docs: 'DOC?',
                    insert: 'get_row_spacing()'
                },
                {
                    label: 'insert_column',
                    detail: 'insert_column(position)',
                    docs: 'DOC?',
                    insert: 'insert_column($1)'
                },
                {
                    label: 'insert_next_to',
                    detail: 'insert_next_to(sibling, side)',
                    docs: 'DOC?',
                    insert: 'insert_next_to($1)'
                },
                {
                    label: 'insert_row',
                    detail: 'insert_row(position)',
                    docs: 'DOC?',
                    insert: 'insert_row($1)'
                },
                {
                    label: 'remove_column',
                    detail: 'remove_column(position)',
                    docs: 'DOC?',
                    insert: 'remove_column($1)'
                },
                {
                    label: 'remove_row',
                    detail: 'remove_row(position)',
                    docs: 'DOC?',
                    insert: 'remove_row($1)'
                },
                {
                    label: 'set_baseline_row',
                    detail: 'set_baseline_row(row)',
                    docs: 'DOC?',
                    insert: 'set_baseline_row($1)'
                },
                {
                    label: 'set_column_homogeneous',
                    detail: 'set_column_homogeneous(homogeneous)',
                    docs: 'DOC?',
                    insert: 'set_column_homogeneous($1)'
                },
                {
                    label: 'set_column_spacing',
                    detail: 'set_column_spacing(spacing)',
                    docs: 'DOC?',
                    insert: 'set_column_spacing($1)'
                },
                {
                    label: 'set_row_baseline_position',
                    detail: 'set_row_baseline_position(row, pos)',
                    docs: 'DOC?',
                    insert: 'set_row_baseline_position($1)'
                },
                {
                    label: 'set_row_homogeneous',
                    detail: 'set_row_homogeneous(homogeneous)',
                    docs: 'DOC?',
                    insert: 'set_row_homogeneous($1)'
                },
                {
                    label: 'set_row_spacing',
                    detail: 'set_row_spacing(spacing)',
                    docs: 'DOC?',
                    insert: 'set_row_spacing($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkHeaderBar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'get_custom_title',
                    detail: 'get_custom_title()',
                    docs: 'DOC?',
                    insert: 'get_custom_title()'
                },
                {
                    label: 'get_decoration_layout',
                    detail: 'get_decoration_layout()',
                    docs: 'DOC?',
                    insert: 'get_decoration_layout()'
                },
                {
                    label: 'get_has_subtitle',
                    detail: 'get_has_subtitle()',
                    docs: 'DOC?',
                    insert: 'get_has_subtitle()'
                },
                {
                    label: 'get_show_close_button',
                    detail: 'get_show_close_button()',
                    docs: 'DOC?',
                    insert: 'get_show_close_button()'
                },
                {
                    label: 'get_subtitle',
                    detail: 'get_subtitle()',
                    docs: 'DOC?',
                    insert: 'get_subtitle()'
                },
                {
                    label: 'get_title',
                    detail: 'get_title()',
                    docs: 'DOC?',
                    insert: 'get_title()'
                },
                {
                    label: 'pack_end',
                    detail: 'pack_end(child)',
                    docs: 'DOC?',
                    insert: 'pack_end($1)'
                },
                {
                    label: 'pack_start',
                    detail: 'pack_start(child)',
                    docs: 'DOC?',
                    insert: 'pack_start($1)'
                },
                {
                    label: 'set_custom_title',
                    detail: 'set_custom_title(title_widget)',
                    docs: 'DOC?',
                    insert: 'set_custom_title($1)'
                },
                {
                    label: 'set_decoration_layout',
                    detail: 'set_decoration_layout(layout)',
                    docs: 'DOC?',
                    insert: 'set_decoration_layout($1)'
                },
                {
                    label: 'set_has_subtitle',
                    detail: 'set_has_subtitle(setting)',
                    docs: 'DOC?',
                    insert: 'set_has_subtitle($1)'
                },
                {
                    label: 'set_show_close_button',
                    detail: 'set_show_close_button(setting)',
                    docs: 'DOC?',
                    insert: 'set_show_close_button($1)'
                },
                {
                    label: 'set_subtitle',
                    detail: 'set_subtitle(subtitle)',
                    docs: 'DOC?',
                    insert: 'set_subtitle($1)'
                },
                {
                    label: 'set_title',
                    detail: 'set_title(title)',
                    docs: 'DOC?',
                    insert: 'set_title($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkIconView = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_with_area',
                    detail: 'new_with_area(area)',
                    docs: 'DOC?',
                    insert: 'new_with_area($1)'
                },
                {
                    label: 'new_with_model',
                    detail: 'new_with_model(model)',
                    docs: 'DOC?',
                    insert: 'new_with_model($1)'
                },
                {
                    label: 'convert_widget_to_bin_window_coords',
                    detail: 'convert_widget_to_bin_window_coords(wx, wy)',
                    docs: 'DOC?',
                    insert: 'convert_widget_to_bin_window_coords($1)'
                },
                {
                    label: 'create_drag_icon',
                    detail: 'create_drag_icon(path)',
                    docs: 'DOC?',
                    insert: 'create_drag_icon($1)'
                },
                {
                    label: 'enable_model_drag_dest',
                    detail: 'enable_model_drag_dest(targets, actions)',
                    docs: 'DOC?',
                    insert: 'enable_model_drag_dest($1)'
                },
                {
                    label: 'enable_model_drag_source',
                    detail: 'enable_model_drag_source(start_button_mask, targets, actions)',
                    docs: 'DOC?',
                    insert: 'enable_model_drag_source($1)'
                },
                {
                    label: 'get_activate_on_single_click',
                    detail: 'get_activate_on_single_click()',
                    docs: 'DOC?',
                    insert: 'get_activate_on_single_click()'
                },
                {
                    label: 'get_cell_rect',
                    detail: 'get_cell_rect(path, cell)',
                    docs: 'DOC?',
                    insert: 'get_cell_rect($1)'
                },
                {
                    label: 'get_column_spacing',
                    detail: 'get_column_spacing()',
                    docs: 'DOC?',
                    insert: 'get_column_spacing()'
                },
                {
                    label: 'get_columns',
                    detail: 'get_columns()',
                    docs: 'DOC?',
                    insert: 'get_columns()'
                },
                {
                    label: 'get_cursor',
                    detail: 'get_cursor()',
                    docs: 'DOC?',
                    insert: 'get_cursor()'
                },
                {
                    label: 'get_dest_item_at_pos',
                    detail: 'get_dest_item_at_pos(drag_x, drag_y)',
                    docs: 'DOC?',
                    insert: 'get_dest_item_at_pos($1)'
                },
                {
                    label: 'get_drag_dest_item',
                    detail: 'get_drag_dest_item()',
                    docs: 'DOC?',
                    insert: 'get_drag_dest_item()'
                },
                {
                    label: 'get_item_at_pos',
                    detail: 'get_item_at_pos(x, y)',
                    docs: 'DOC?',
                    insert: 'get_item_at_pos($1)'
                },
                {
                    label: 'get_item_column',
                    detail: 'get_item_column(path)',
                    docs: 'DOC?',
                    insert: 'get_item_column($1)'
                },
                {
                    label: 'get_item_orientation',
                    detail: 'get_item_orientation()',
                    docs: 'DOC?',
                    insert: 'get_item_orientation()'
                },
                {
                    label: 'get_item_padding',
                    detail: 'get_item_padding()',
                    docs: 'DOC?',
                    insert: 'get_item_padding()'
                },
                {
                    label: 'get_item_row',
                    detail: 'get_item_row(path)',
                    docs: 'DOC?',
                    insert: 'get_item_row($1)'
                },
                {
                    label: 'get_item_width',
                    detail: 'get_item_width()',
                    docs: 'DOC?',
                    insert: 'get_item_width()'
                },
                {
                    label: 'get_margin',
                    detail: 'get_margin()',
                    docs: 'DOC?',
                    insert: 'get_margin()'
                },
                {
                    label: 'get_markup_column',
                    detail: 'get_markup_column()',
                    docs: 'DOC?',
                    insert: 'get_markup_column()'
                },
                {
                    label: 'get_model',
                    detail: 'get_model()',
                    docs: 'DOC?',
                    insert: 'get_model()'
                },
                {
                    label: 'get_path_at_pos',
                    detail: 'get_path_at_pos(x, y)',
                    docs: 'DOC?',
                    insert: 'get_path_at_pos($1)'
                },
                {
                    label: 'get_pixbuf_column',
                    detail: 'get_pixbuf_column()',
                    docs: 'DOC?',
                    insert: 'get_pixbuf_column()'
                },
                {
                    label: 'get_reorderable',
                    detail: 'get_reorderable()',
                    docs: 'DOC?',
                    insert: 'get_reorderable()'
                },
                {
                    label: 'get_row_spacing',
                    detail: 'get_row_spacing()',
                    docs: 'DOC?',
                    insert: 'get_row_spacing()'
                },
                {
                    label: 'get_selected_items',
                    detail: 'get_selected_items()',
                    docs: 'DOC?',
                    insert: 'get_selected_items()'
                },
                {
                    label: 'get_selection_mode',
                    detail: 'get_selection_mode()',
                    docs: 'DOC?',
                    insert: 'get_selection_mode()'
                },
                {
                    label: 'get_spacing',
                    detail: 'get_spacing()',
                    docs: 'DOC?',
                    insert: 'get_spacing()'
                },
                {
                    label: 'get_text_column',
                    detail: 'get_text_column()',
                    docs: 'DOC?',
                    insert: 'get_text_column()'
                },
                {
                    label: 'get_tooltip_column',
                    detail: 'get_tooltip_column()',
                    docs: 'DOC?',
                    insert: 'get_tooltip_column()'
                },
                {
                    label: 'get_tooltip_context',
                    detail: 'get_tooltip_context(x, y, keyboard_tip)',
                    docs: 'DOC?',
                    insert: 'get_tooltip_context($1)'
                },
                {
                    label: 'get_visible_range',
                    detail: 'get_visible_range()',
                    docs: 'DOC?',
                    insert: 'get_visible_range()'
                },
                {
                    label: 'item_activated',
                    detail: 'item_activated(path)',
                    docs: 'DOC?',
                    insert: 'item_activated($1)'
                },
                {
                    label: 'path_is_selected',
                    detail: 'path_is_selected(path)',
                    docs: 'DOC?',
                    insert: 'path_is_selected($1)'
                },
                {
                    label: 'scroll_to_path',
                    detail: 'scroll_to_path(path, use_align, row_align, col_align)',
                    docs: 'DOC?',
                    insert: 'scroll_to_path($1)'
                },
                {
                    label: 'select_all',
                    detail: 'select_all()',
                    docs: 'DOC?',
                    insert: 'select_all()'
                },
                {
                    label: 'select_path',
                    detail: 'select_path(path)',
                    docs: 'DOC?',
                    insert: 'select_path($1)'
                },
                {
                    label: 'selected_foreach',
                    detail: 'selected_foreach(func, *data)',
                    docs: 'DOC?',
                    insert: 'selected_foreach($1)'
                },
                {
                    label: 'set_activate_on_single_click',
                    detail: 'set_activate_on_single_click(single)',
                    docs: 'DOC?',
                    insert: 'set_activate_on_single_click($1)'
                },
                {
                    label: 'set_column_spacing',
                    detail: 'set_column_spacing(column_spacing)',
                    docs: 'DOC?',
                    insert: 'set_column_spacing($1)'
                },
                {
                    label: 'set_columns',
                    detail: 'set_columns(columns)',
                    docs: 'DOC?',
                    insert: 'set_columns($1)'
                },
                {
                    label: 'set_cursor',
                    detail: 'set_cursor(path, cell, start_editing)',
                    docs: 'DOC?',
                    insert: 'set_cursor($1)'
                },
                {
                    label: 'set_drag_dest_item',
                    detail: 'set_drag_dest_item(path, pos)',
                    docs: 'DOC?',
                    insert: 'set_drag_dest_item($1)'
                },
                {
                    label: 'set_item_orientation',
                    detail: 'set_item_orientation(orientation)',
                    docs: 'DOC?',
                    insert: 'set_item_orientation($1)'
                },
                {
                    label: 'set_item_padding',
                    detail: 'set_item_padding(item_padding)',
                    docs: 'DOC?',
                    insert: 'set_item_padding($1)'
                },
                {
                    label: 'set_item_width',
                    detail: 'set_item_width(item_width)',
                    docs: 'DOC?',
                    insert: 'set_item_width($1)'
                },
                {
                    label: 'set_margin',
                    detail: 'set_margin(margin)',
                    docs: 'DOC?',
                    insert: 'set_margin($1)'
                },
                {
                    label: 'set_markup_column',
                    detail: 'set_markup_column(column)',
                    docs: 'DOC?',
                    insert: 'set_markup_column($1)'
                },
                {
                    label: 'set_model',
                    detail: 'set_model(model)',
                    docs: 'DOC?',
                    insert: 'set_model($1)'
                },
                {
                    label: 'set_pixbuf_column',
                    detail: 'set_pixbuf_column(column)',
                    docs: 'DOC?',
                    insert: 'set_pixbuf_column($1)'
                },
                {
                    label: 'set_reorderable',
                    detail: 'set_reorderable(reorderable)',
                    docs: 'DOC?',
                    insert: 'set_reorderable($1)'
                },
                {
                    label: 'set_row_spacing',
                    detail: 'set_row_spacing(row_spacing)',
                    docs: 'DOC?',
                    insert: 'set_row_spacing($1)'
                },
                {
                    label: 'set_selection_mode',
                    detail: 'set_selection_mode(mode)',
                    docs: 'DOC?',
                    insert: 'set_selection_mode($1)'
                },
                {
                    label: 'set_spacing',
                    detail: 'set_spacing(spacing)',
                    docs: 'DOC?',
                    insert: 'set_spacing($1)'
                },
                {
                    label: 'set_text_column',
                    detail: 'set_text_column(column)',
                    docs: 'DOC?',
                    insert: 'set_text_column($1)'
                },
                {
                    label: 'set_tooltip_cell',
                    detail: 'set_tooltip_cell(tooltip, path, cell)',
                    docs: 'DOC?',
                    insert: 'set_tooltip_cell($1)'
                },
                {
                    label: 'set_tooltip_column',
                    detail: 'set_tooltip_column(column)',
                    docs: 'DOC?',
                    insert: 'set_tooltip_column($1)'
                },
                {
                    label: 'set_tooltip_item',
                    detail: 'set_tooltip_item(tooltip, path)',
                    docs: 'DOC?',
                    insert: 'set_tooltip_item($1)'
                },
                {
                    label: 'unselect_all',
                    detail: 'unselect_all()',
                    docs: 'DOC?',
                    insert: 'unselect_all()'
                },
                {
                    label: 'unselect_path',
                    detail: 'unselect_path(path)',
                    docs: 'DOC?',
                    insert: 'unselect_path($1)'
                },
                {
                    label: 'unset_model_drag_dest',
                    detail: 'unset_model_drag_dest()',
                    docs: 'DOC?',
                    insert: 'unset_model_drag_dest()'
                },
                {
                    label: 'unset_model_drag_source',
                    detail: 'unset_model_drag_source()',
                    docs: 'DOC?',
                    insert: 'unset_model_drag_source()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkScrollable = [
                {
                    label: 'get_border',
                    detail: 'get_border()',
                    docs: 'DOC?',
                    insert: 'get_border()'
                },
                {
                    label: 'get_hadjustment',
                    detail: 'get_hadjustment()',
                    docs: 'DOC?',
                    insert: 'get_hadjustment()'
                },
                {
                    label: 'get_hscroll_policy',
                    detail: 'get_hscroll_policy()',
                    docs: 'DOC?',
                    insert: 'get_hscroll_policy()'
                },
                {
                    label: 'get_vadjustment',
                    detail: 'get_vadjustment()',
                    docs: 'DOC?',
                    insert: 'get_vadjustment()'
                },
                {
                    label: 'get_vscroll_policy',
                    detail: 'get_vscroll_policy()',
                    docs: 'DOC?',
                    insert: 'get_vscroll_policy()'
                },
                {
                    label: 'set_hadjustment',
                    detail: 'set_hadjustment(hadjustment)',
                    docs: 'DOC?',
                    insert: 'set_hadjustment($1)'
                },
                {
                    label: 'set_hscroll_policy',
                    detail: 'set_hscroll_policy(policy)',
                    docs: 'DOC?',
                    insert: 'set_hscroll_policy($1)'
                },
                {
                    label: 'set_vadjustment',
                    detail: 'set_vadjustment(vadjustment)',
                    docs: 'DOC?',
                    insert: 'set_vadjustment($1)'
                },
                {
                    label: 'set_vscroll_policy',
                    detail: 'set_vscroll_policy(policy)',
                    docs: 'DOC?',
                    insert: 'set_vscroll_policy($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkImage = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_from_animation',
                    detail: 'new_from_animation(animation)',
                    docs: 'DOC?',
                    insert: 'new_from_animation($1)'
                },
                {
                    label: 'new_from_file',
                    detail: 'new_from_file(filename)',
                    docs: 'DOC?',
                    insert: 'new_from_file($1)'
                },
                {
                    label: 'new_from_gicon',
                    detail: 'new_from_gicon(icon, size)',
                    docs: 'DOC?',
                    insert: 'new_from_gicon($1)'
                },
                {
                    label: 'new_from_icon_name',
                    detail: 'new_from_icon_name(icon_name, size)',
                    docs: 'DOC?',
                    insert: 'new_from_icon_name($1)'
                },
                {
                    label: 'new_from_icon_set',
                    detail: 'new_from_icon_set(icon_set, size)',
                    docs: 'DOC?',
                    insert: 'new_from_icon_set($1)'
                },
                {
                    label: 'new_from_pixbuf',
                    detail: 'new_from_pixbuf(pixbuf)',
                    docs: 'DOC?',
                    insert: 'new_from_pixbuf($1)'
                },
                {
                    label: 'new_from_resource',
                    detail: 'new_from_resource(resource_path)',
                    docs: 'DOC?',
                    insert: 'new_from_resource($1)'
                },
                {
                    label: 'new_from_stock',
                    detail: 'new_from_stock(stock_id, size)',
                    docs: 'DOC?',
                    insert: 'new_from_stock($1)'
                },
                {
                    label: 'new_from_surface',
                    detail: 'new_from_surface(surface)',
                    docs: 'DOC?',
                    insert: 'new_from_surface($1)'
                },
                {
                    label: 'clear',
                    detail: 'clear()',
                    docs: 'DOC?',
                    insert: 'clear()'
                },
                {
                    label: 'get_animation',
                    detail: 'get_animation()',
                    docs: 'DOC?',
                    insert: 'get_animation()'
                },
                {
                    label: 'get_gicon',
                    detail: 'get_gicon()',
                    docs: 'DOC?',
                    insert: 'get_gicon()'
                },
                {
                    label: 'get_icon_name',
                    detail: 'get_icon_name()',
                    docs: 'DOC?',
                    insert: 'get_icon_name()'
                },
                {
                    label: 'get_icon_set',
                    detail: 'get_icon_set()',
                    docs: 'DOC?',
                    insert: 'get_icon_set()'
                },
                {
                    label: 'get_pixbuf',
                    detail: 'get_pixbuf()',
                    docs: 'DOC?',
                    insert: 'get_pixbuf()'
                },
                {
                    label: 'get_pixel_size',
                    detail: 'get_pixel_size()',
                    docs: 'DOC?',
                    insert: 'get_pixel_size()'
                },
                {
                    label: 'get_stock',
                    detail: 'get_stock()',
                    docs: 'DOC?',
                    insert: 'get_stock()'
                },
                {
                    label: 'get_storage_type',
                    detail: 'get_storage_type()',
                    docs: 'DOC?',
                    insert: 'get_storage_type()'
                },
                {
                    label: 'set_from_animation',
                    detail: 'set_from_animation(animation)',
                    docs: 'DOC?',
                    insert: 'set_from_animation($1)'
                },
                {
                    label: 'set_from_file',
                    detail: 'set_from_file(filename)',
                    docs: 'DOC?',
                    insert: 'set_from_file($1)'
                },
                {
                    label: 'set_from_gicon',
                    detail: 'set_from_gicon(icon, size)',
                    docs: 'DOC?',
                    insert: 'set_from_gicon($1)'
                },
                {
                    label: 'set_from_icon_name',
                    detail: 'set_from_icon_name(icon_name, size)',
                    docs: 'DOC?',
                    insert: 'set_from_icon_name($1)'
                },
                {
                    label: 'set_from_icon_set',
                    detail: 'set_from_icon_set(icon_set, size)',
                    docs: 'DOC?',
                    insert: 'set_from_icon_set($1)'
                },
                {
                    label: 'set_from_pixbuf',
                    detail: 'set_from_pixbuf(pixbuf)',
                    docs: 'DOC?',
                    insert: 'set_from_pixbuf($1)'
                },
                {
                    label: 'set_from_resource',
                    detail: 'set_from_resource(resource_path)',
                    docs: 'DOC?',
                    insert: 'set_from_resource($1)'
                },
                {
                    label: 'set_from_stock',
                    detail: 'set_from_stock(stock_id, size)',
                    docs: 'DOC?',
                    insert: 'set_from_stock($1)'
                },
                {
                    label: 'set_from_surface',
                    detail: 'set_from_surface(surface)',
                    docs: 'DOC?',
                    insert: 'set_from_surface($1)'
                },
                {
                    label: 'set_pixel_size',
                    detail: 'set_pixel_size(pixel_size)',
                    docs: 'DOC?',
                    insert: 'set_pixel_size($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkInfoBar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'add_action_widget',
                    detail: 'add_action_widget(child, response_id)',
                    docs: 'DOC?',
                    insert: 'add_action_widget($1)'
                },
                {
                    label: 'add_button',
                    detail: 'add_button(button_text, response_id)',
                    docs: 'DOC?',
                    insert: 'add_button($1)'
                },
                {
                    label: 'get_action_area',
                    detail: 'get_action_area()',
                    docs: 'DOC?',
                    insert: 'get_action_area()'
                },
                {
                    label: 'get_content_area',
                    detail: 'get_content_area()',
                    docs: 'DOC?',
                    insert: 'get_content_area()'
                },
                {
                    label: 'get_message_type',
                    detail: 'get_message_type()',
                    docs: 'DOC?',
                    insert: 'get_message_type()'
                },
                {
                    label: 'get_revealed',
                    detail: 'get_revealed()',
                    docs: 'DOC?',
                    insert: 'get_revealed()'
                },
                {
                    label: 'get_show_close_button',
                    detail: 'get_show_close_button()',
                    docs: 'DOC?',
                    insert: 'get_show_close_button()'
                },
                {
                    label: 'response',
                    detail: 'response(response_id)',
                    docs: 'DOC?',
                    insert: 'response($1)'
                },
                {
                    label: 'set_default_response',
                    detail: 'set_default_response(response_id)',
                    docs: 'DOC?',
                    insert: 'set_default_response($1)'
                },
                {
                    label: 'set_message_type',
                    detail: 'set_message_type(message_type)',
                    docs: 'DOC?',
                    insert: 'set_message_type($1)'
                },
                {
                    label: 'set_response_sensitive',
                    detail: 'set_response_sensitive(response_id, setting)',
                    docs: 'DOC?',
                    insert: 'set_response_sensitive($1)'
                },
                {
                    label: 'set_revealed',
                    detail: 'set_revealed(revealed)',
                    docs: 'DOC?',
                    insert: 'set_revealed($1)'
                },
                {
                    label: 'set_show_close_button',
                    detail: 'set_show_close_button(setting)',
                    docs: 'DOC?',
                    insert: 'set_show_close_button($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkLevelBar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_for_interval',
                    detail: 'new_for_interval(min_value, max_value)',
                    docs: 'DOC?',
                    insert: 'new_for_interval($1)'
                },
                {
                    label: 'add_offset_value',
                    detail: 'add_offset_value(name, value)',
                    docs: 'DOC?',
                    insert: 'add_offset_value($1)'
                },
                {
                    label: 'get_inverted',
                    detail: 'get_inverted()',
                    docs: 'DOC?',
                    insert: 'get_inverted()'
                },
                {
                    label: 'get_max_value',
                    detail: 'get_max_value()',
                    docs: 'DOC?',
                    insert: 'get_max_value()'
                },
                {
                    label: 'get_min_value',
                    detail: 'get_min_value()',
                    docs: 'DOC?',
                    insert: 'get_min_value()'
                },
                {
                    label: 'get_mode',
                    detail: 'get_mode()',
                    docs: 'DOC?',
                    insert: 'get_mode()'
                },
                {
                    label: 'get_offset_value',
                    detail: 'get_offset_value(name)',
                    docs: 'DOC?',
                    insert: 'get_offset_value($1)'
                },
                {
                    label: 'get_value',
                    detail: 'get_value()',
                    docs: 'DOC?',
                    insert: 'get_value()'
                },
                {
                    label: 'remove_offset_value',
                    detail: 'remove_offset_value(name)',
                    docs: 'DOC?',
                    insert: 'remove_offset_value($1)'
                },
                {
                    label: 'set_inverted',
                    detail: 'set_inverted(inverted)',
                    docs: 'DOC?',
                    insert: 'set_inverted($1)'
                },
                {
                    label: 'set_max_value',
                    detail: 'set_max_value(value)',
                    docs: 'DOC?',
                    insert: 'set_max_value($1)'
                },
                {
                    label: 'set_min_value',
                    detail: 'set_min_value(value)',
                    docs: 'DOC?',
                    insert: 'set_min_value($1)'
                },
                {
                    label: 'set_mode',
                    detail: 'set_mode(mode)',
                    docs: 'DOC?',
                    insert: 'set_mode($1)'
                },
                {
                    label: 'set_value',
                    detail: 'set_value(value)',
                    docs: 'DOC?',
                    insert: 'set_value($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkLinkButton = [
                {
                    label: 'new',
                    detail: 'new(uri)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'new_with_label',
                    detail: 'new_with_label(uri, label)',
                    docs: 'DOC?',
                    insert: 'new_with_label($1)'
                },
                {
                    label: 'get_uri',
                    detail: 'get_uri()',
                    docs: 'DOC?',
                    insert: 'get_uri()'
                },
                {
                    label: 'get_visited',
                    detail: 'get_visited()',
                    docs: 'DOC?',
                    insert: 'get_visited()'
                },
                {
                    label: 'set_uri',
                    detail: 'set_uri(uri)',
                    docs: 'DOC?',
                    insert: 'set_uri($1)'
                },
                {
                    label: 'set_visited',
                    detail: 'set_visited(visited)',
                    docs: 'DOC?',
                    insert: 'set_visited($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkListBox = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'bind_model',
                    detail: 'bind_model(model, create_widget_func, *user_data)',
                    docs: 'DOC?',
                    insert: 'bind_model($1)'
                },
                {
                    label: 'drag_highlight_row',
                    detail: 'drag_highlight_row(row)',
                    docs: 'DOC?',
                    insert: 'drag_highlight_row($1)'
                },
                {
                    label: 'drag_unhighlight_row',
                    detail: 'drag_unhighlight_row()',
                    docs: 'DOC?',
                    insert: 'drag_unhighlight_row()'
                },
                {
                    label: 'get_activate_on_single_click',
                    detail: 'get_activate_on_single_click()',
                    docs: 'DOC?',
                    insert: 'get_activate_on_single_click()'
                },
                {
                    label: 'get_adjustment',
                    detail: 'get_adjustment()',
                    docs: 'DOC?',
                    insert: 'get_adjustment()'
                },
                {
                    label: 'get_row_at_index',
                    detail: 'get_row_at_index(index_)',
                    docs: 'DOC?',
                    insert: 'get_row_at_index($1)'
                },
                {
                    label: 'get_row_at_y',
                    detail: 'get_row_at_y(y)',
                    docs: 'DOC?',
                    insert: 'get_row_at_y($1)'
                },
                {
                    label: 'get_selected_row',
                    detail: 'get_selected_row()',
                    docs: 'DOC?',
                    insert: 'get_selected_row()'
                },
                {
                    label: 'get_selected_rows',
                    detail: 'get_selected_rows()',
                    docs: 'DOC?',
                    insert: 'get_selected_rows()'
                },
                {
                    label: 'get_selection_mode',
                    detail: 'get_selection_mode()',
                    docs: 'DOC?',
                    insert: 'get_selection_mode()'
                },
                {
                    label: 'insert',
                    detail: 'insert(child, position)',
                    docs: 'DOC?',
                    insert: 'insert($1)'
                },
                {
                    label: 'invalidate_filter',
                    detail: 'invalidate_filter()',
                    docs: 'DOC?',
                    insert: 'invalidate_filter()'
                },
                {
                    label: 'invalidate_headers',
                    detail: 'invalidate_headers()',
                    docs: 'DOC?',
                    insert: 'invalidate_headers()'
                },
                {
                    label: 'invalidate_sort',
                    detail: 'invalidate_sort()',
                    docs: 'DOC?',
                    insert: 'invalidate_sort()'
                },
                {
                    label: 'prepend',
                    detail: 'prepend(child)',
                    docs: 'DOC?',
                    insert: 'prepend($1)'
                },
                {
                    label: 'select_all',
                    detail: 'select_all()',
                    docs: 'DOC?',
                    insert: 'select_all()'
                },
                {
                    label: 'select_row',
                    detail: 'select_row(row)',
                    docs: 'DOC?',
                    insert: 'select_row($1)'
                },
                {
                    label: 'selected_foreach',
                    detail: 'selected_foreach(func, *data)',
                    docs: 'DOC?',
                    insert: 'selected_foreach($1)'
                },
                {
                    label: 'set_activate_on_single_click',
                    detail: 'set_activate_on_single_click(single)',
                    docs: 'DOC?',
                    insert: 'set_activate_on_single_click($1)'
                },
                {
                    label: 'set_adjustment',
                    detail: 'set_adjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_adjustment($1)'
                },
                {
                    label: 'set_filter_func',
                    detail: 'set_filter_func(filter_func, *user_data)',
                    docs: 'DOC?',
                    insert: 'set_filter_func($1)'
                },
                {
                    label: 'set_header_func',
                    detail: 'set_header_func(update_header, *user_data)',
                    docs: 'DOC?',
                    insert: 'set_header_func($1)'
                },
                {
                    label: 'set_placeholder',
                    detail: 'set_placeholder(placeholder)',
                    docs: 'DOC?',
                    insert: 'set_placeholder($1)'
                },
                {
                    label: 'set_selection_mode',
                    detail: 'set_selection_mode(mode)',
                    docs: 'DOC?',
                    insert: 'set_selection_mode($1)'
                },
                {
                    label: 'set_sort_func',
                    detail: 'set_sort_func(sort_func, *user_data)',
                    docs: 'DOC?',
                    insert: 'set_sort_func($1)'
                },
                {
                    label: 'unselect_all',
                    detail: 'unselect_all()',
                    docs: 'DOC?',
                    insert: 'unselect_all()'
                },
                {
                    label: 'unselect_row',
                    detail: 'unselect_row(row)',
                    docs: 'DOC?',
                    insert: 'unselect_row($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkLockButton = [
                {
                    label: 'new',
                    detail: 'new(permission)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'get_permission',
                    detail: 'get_permission()',
                    docs: 'DOC?',
                    insert: 'get_permission()'
                },
                {
                    label: 'set_permission',
                    detail: 'set_permission(permission)',
                    docs: 'DOC?',
                    insert: 'set_permission($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkMenuBar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_from_model',
                    detail: 'new_from_model(model)',
                    docs: 'DOC?',
                    insert: 'new_from_model($1)'
                },
                {
                    label: 'get_child_pack_direction',
                    detail: 'get_child_pack_direction()',
                    docs: 'DOC?',
                    insert: 'get_child_pack_direction()'
                },
                {
                    label: 'get_pack_direction',
                    detail: 'get_pack_direction()',
                    docs: 'DOC?',
                    insert: 'get_pack_direction()'
                },
                {
                    label: 'set_child_pack_direction',
                    detail: 'set_child_pack_direction(child_pack_dir)',
                    docs: 'DOC?',
                    insert: 'set_child_pack_direction($1)'
                },
                {
                    label: 'set_pack_direction',
                    detail: 'set_pack_direction(pack_dir)',
                    docs: 'DOC?',
                    insert: 'set_pack_direction($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkMenuShell = [
                {
                    label: 'activate_item',
                    detail: 'activate_item(menu_item, force_deactivate)',
                    docs: 'DOC?',
                    insert: 'activate_item($1)'
                },
                {
                    label: 'append',
                    detail: 'append(child)',
                    docs: 'DOC?',
                    insert: 'append($1)'
                },
                {
                    label: 'bind_model',
                    detail: 'bind_model(model, action_namespace, with_separators)',
                    docs: 'DOC?',
                    insert: 'bind_model($1)'
                },
                {
                    label: 'cancel',
                    detail: 'cancel()',
                    docs: 'DOC?',
                    insert: 'cancel()'
                },
                {
                    label: 'deactivate',
                    detail: 'deactivate()',
                    docs: 'DOC?',
                    insert: 'deactivate()'
                },
                {
                    label: 'deselect',
                    detail: 'deselect()',
                    docs: 'DOC?',
                    insert: 'deselect()'
                },
                {
                    label: 'get_parent_shell',
                    detail: 'get_parent_shell()',
                    docs: 'DOC?',
                    insert: 'get_parent_shell()'
                },
                {
                    label: 'get_selected_item',
                    detail: 'get_selected_item()',
                    docs: 'DOC?',
                    insert: 'get_selected_item()'
                },
                {
                    label: 'get_take_focus',
                    detail: 'get_take_focus()',
                    docs: 'DOC?',
                    insert: 'get_take_focus()'
                },
                {
                    label: 'insert',
                    detail: 'insert(child, position)',
                    docs: 'DOC?',
                    insert: 'insert($1)'
                },
                {
                    label: 'prepend',
                    detail: 'prepend(child)',
                    docs: 'DOC?',
                    insert: 'prepend($1)'
                },
                {
                    label: 'select_first',
                    detail: 'select_first(search_sensitive)',
                    docs: 'DOC?',
                    insert: 'select_first($1)'
                },
                {
                    label: 'select_item',
                    detail: 'select_item(menu_item)',
                    docs: 'DOC?',
                    insert: 'select_item($1)'
                },
                {
                    label: 'set_take_focus',
                    detail: 'set_take_focus(take_focus)',
                    docs: 'DOC?',
                    insert: 'set_take_focus($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkMenuButton = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'get_align_widget',
                    detail: 'get_align_widget()',
                    docs: 'DOC?',
                    insert: 'get_align_widget()'
                },
                {
                    label: 'get_direction',
                    detail: 'get_direction()',
                    docs: 'DOC?',
                    insert: 'get_direction()'
                },
                {
                    label: 'get_menu_model',
                    detail: 'get_menu_model()',
                    docs: 'DOC?',
                    insert: 'get_menu_model()'
                },
                {
                    label: 'get_popover',
                    detail: 'get_popover()',
                    docs: 'DOC?',
                    insert: 'get_popover()'
                },
                {
                    label: 'get_popup',
                    detail: 'get_popup()',
                    docs: 'DOC?',
                    insert: 'get_popup()'
                },
                {
                    label: 'get_use_popover',
                    detail: 'get_use_popover()',
                    docs: 'DOC?',
                    insert: 'get_use_popover()'
                },
                {
                    label: 'set_align_widget',
                    detail: 'set_align_widget(align_widget)',
                    docs: 'DOC?',
                    insert: 'set_align_widget($1)'
                },
                {
                    label: 'set_direction',
                    detail: 'set_direction(direction)',
                    docs: 'DOC?',
                    insert: 'set_direction($1)'
                },
                {
                    label: 'set_menu_model',
                    detail: 'set_menu_model(menu_model)',
                    docs: 'DOC?',
                    insert: 'set_menu_model($1)'
                },
                {
                    label: 'set_popover',
                    detail: 'set_popover(popover)',
                    docs: 'DOC?',
                    insert: 'set_popover($1)'
                },
                {
                    label: 'set_popup',
                    detail: 'set_popup(menu)',
                    docs: 'DOC?',
                    insert: 'set_popup($1)'
                },
                {
                    label: 'set_use_popover',
                    detail: 'set_use_popover(use_popover)',
                    docs: 'DOC?',
                    insert: 'set_use_popover($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkMessageDialog = [
                {
                    label: 'format_secondary_markup',
                    detail: 'format_secondary_markup(message_format)',
                    docs: 'DOC?',
                    insert: 'format_secondary_markup($1)'
                },
                {
                    label: 'format_secondary_text',
                    detail: 'format_secondary_text(message_format)',
                    docs: 'DOC?',
                    insert: 'format_secondary_text($1)'
                },
                {
                    label: 'get_image',
                    detail: 'get_image()',
                    docs: 'DOC?',
                    insert: 'get_image()'
                },
                {
                    label: 'get_message_area',
                    detail: 'get_message_area()',
                    docs: 'DOC?',
                    insert: 'get_message_area()'
                },
                {
                    label: 'set_image',
                    detail: 'set_image(image)',
                    docs: 'DOC?',
                    insert: 'set_image($1)'
                },
                {
                    label: 'set_markup',
                    detail: 'set_markup(str)',
                    docs: 'DOC?',
                    insert: 'set_markup($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkNotebook = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'append_page',
                    detail: 'append_page(child, tab_label)',
                    docs: 'DOC?',
                    insert: 'append_page($1)'
                },
                {
                    label: 'append_page_menu',
                    detail: 'append_page_menu(child, tab_label, menu_label)',
                    docs: 'DOC?',
                    insert: 'append_page_menu($1)'
                },
                {
                    label: 'detach_tab',
                    detail: 'detach_tab(child)',
                    docs: 'DOC?',
                    insert: 'detach_tab($1)'
                },
                {
                    label: 'get_action_widget',
                    detail: 'get_action_widget(pack_type)',
                    docs: 'DOC?',
                    insert: 'get_action_widget($1)'
                },
                {
                    label: 'get_current_page',
                    detail: 'get_current_page()',
                    docs: 'DOC?',
                    insert: 'get_current_page()'
                },
                {
                    label: 'get_group_name',
                    detail: 'get_group_name()',
                    docs: 'DOC?',
                    insert: 'get_group_name()'
                },
                {
                    label: 'get_menu_label',
                    detail: 'get_menu_label(child)',
                    docs: 'DOC?',
                    insert: 'get_menu_label($1)'
                },
                {
                    label: 'get_menu_label_text',
                    detail: 'get_menu_label_text(child)',
                    docs: 'DOC?',
                    insert: 'get_menu_label_text($1)'
                },
                {
                    label: 'get_n_pages',
                    detail: 'get_n_pages()',
                    docs: 'DOC?',
                    insert: 'get_n_pages()'
                },
                {
                    label: 'get_nth_page',
                    detail: 'get_nth_page(page_num)',
                    docs: 'DOC?',
                    insert: 'get_nth_page($1)'
                },
                {
                    label: 'get_scrollable',
                    detail: 'get_scrollable()',
                    docs: 'DOC?',
                    insert: 'get_scrollable()'
                },
                {
                    label: 'get_show_border',
                    detail: 'get_show_border()',
                    docs: 'DOC?',
                    insert: 'get_show_border()'
                },
                {
                    label: 'get_show_tabs',
                    detail: 'get_show_tabs()',
                    docs: 'DOC?',
                    insert: 'get_show_tabs()'
                },
                {
                    label: 'get_tab_detachable',
                    detail: 'get_tab_detachable(child)',
                    docs: 'DOC?',
                    insert: 'get_tab_detachable($1)'
                },
                {
                    label: 'get_tab_hborder',
                    detail: 'get_tab_hborder()',
                    docs: 'DOC?',
                    insert: 'get_tab_hborder()'
                },
                {
                    label: 'get_tab_label',
                    detail: 'get_tab_label(child)',
                    docs: 'DOC?',
                    insert: 'get_tab_label($1)'
                },
                {
                    label: 'get_tab_label_text',
                    detail: 'get_tab_label_text(child)',
                    docs: 'DOC?',
                    insert: 'get_tab_label_text($1)'
                },
                {
                    label: 'get_tab_pos',
                    detail: 'get_tab_pos()',
                    docs: 'DOC?',
                    insert: 'get_tab_pos()'
                },
                {
                    label: 'get_tab_reorderable',
                    detail: 'get_tab_reorderable(child)',
                    docs: 'DOC?',
                    insert: 'get_tab_reorderable($1)'
                },
                {
                    label: 'get_tab_vborder',
                    detail: 'get_tab_vborder()',
                    docs: 'DOC?',
                    insert: 'get_tab_vborder()'
                },
                {
                    label: 'insert_page',
                    detail: 'insert_page(child, tab_label, position)',
                    docs: 'DOC?',
                    insert: 'insert_page($1)'
                },
                {
                    label: 'insert_page_menu',
                    detail: 'insert_page_menu(child, tab_label, menu_label, position)',
                    docs: 'DOC?',
                    insert: 'insert_page_menu($1)'
                },
                {
                    label: 'next_page',
                    detail: 'next_page()',
                    docs: 'DOC?',
                    insert: 'next_page()'
                },
                {
                    label: 'page_num',
                    detail: 'page_num(child)',
                    docs: 'DOC?',
                    insert: 'page_num($1)'
                },
                {
                    label: 'popup_disable',
                    detail: 'popup_disable()',
                    docs: 'DOC?',
                    insert: 'popup_disable()'
                },
                {
                    label: 'popup_enable',
                    detail: 'popup_enable()',
                    docs: 'DOC?',
                    insert: 'popup_enable()'
                },
                {
                    label: 'prepend_page',
                    detail: 'prepend_page(child, tab_label)',
                    docs: 'DOC?',
                    insert: 'prepend_page($1)'
                },
                {
                    label: 'prepend_page_menu',
                    detail: 'prepend_page_menu(child, tab_label, menu_label)',
                    docs: 'DOC?',
                    insert: 'prepend_page_menu($1)'
                },
                {
                    label: 'prev_page',
                    detail: 'prev_page()',
                    docs: 'DOC?',
                    insert: 'prev_page()'
                },
                {
                    label: 'remove_page',
                    detail: 'remove_page(page_num)',
                    docs: 'DOC?',
                    insert: 'remove_page($1)'
                },
                {
                    label: 'reorder_child',
                    detail: 'reorder_child(child, position)',
                    docs: 'DOC?',
                    insert: 'reorder_child($1)'
                },
                {
                    label: 'set_action_widget',
                    detail: 'set_action_widget(widget, pack_type)',
                    docs: 'DOC?',
                    insert: 'set_action_widget($1)'
                },
                {
                    label: 'set_current_page',
                    detail: 'set_current_page(page_num)',
                    docs: 'DOC?',
                    insert: 'set_current_page($1)'
                },
                {
                    label: 'set_group_name',
                    detail: 'set_group_name(group_name)',
                    docs: 'DOC?',
                    insert: 'set_group_name($1)'
                },
                {
                    label: 'set_menu_label',
                    detail: 'set_menu_label(child, menu_label)',
                    docs: 'DOC?',
                    insert: 'set_menu_label($1)'
                },
                {
                    label: 'set_menu_label_text',
                    detail: 'set_menu_label_text(child, menu_text)',
                    docs: 'DOC?',
                    insert: 'set_menu_label_text($1)'
                },
                {
                    label: 'set_scrollable',
                    detail: 'set_scrollable(scrollable)',
                    docs: 'DOC?',
                    insert: 'set_scrollable($1)'
                },
                {
                    label: 'set_show_border',
                    detail: 'set_show_border(show_border)',
                    docs: 'DOC?',
                    insert: 'set_show_border($1)'
                },
                {
                    label: 'set_show_tabs',
                    detail: 'set_show_tabs(show_tabs)',
                    docs: 'DOC?',
                    insert: 'set_show_tabs($1)'
                },
                {
                    label: 'set_tab_detachable',
                    detail: 'set_tab_detachable(child, detachable)',
                    docs: 'DOC?',
                    insert: 'set_tab_detachable($1)'
                },
                {
                    label: 'set_tab_label',
                    detail: 'set_tab_label(child, tab_label)',
                    docs: 'DOC?',
                    insert: 'set_tab_label($1)'
                },
                {
                    label: 'set_tab_label_text',
                    detail: 'set_tab_label_text(child, tab_text)',
                    docs: 'DOC?',
                    insert: 'set_tab_label_text($1)'
                },
                {
                    label: 'set_tab_pos',
                    detail: 'set_tab_pos(pos)',
                    docs: 'DOC?',
                    insert: 'set_tab_pos($1)'
                },
                {
                    label: 'set_tab_reorderable',
                    detail: 'set_tab_reorderable(child, reorderable)',
                    docs: 'DOC?',
                    insert: 'set_tab_reorderable($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkPaned = [
                {
                    label: 'new',
                    detail: 'new(orientation)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'add1',
                    detail: 'add1(child)',
                    docs: 'DOC?',
                    insert: 'add1($1)'
                },
                {
                    label: 'add2',
                    detail: 'add2(child)',
                    docs: 'DOC?',
                    insert: 'add2($1)'
                },
                {
                    label: 'get_child1',
                    detail: 'get_child1()',
                    docs: 'DOC?',
                    insert: 'get_child1()'
                },
                {
                    label: 'get_child2',
                    detail: 'get_child2()',
                    docs: 'DOC?',
                    insert: 'get_child2()'
                },
                {
                    label: 'get_handle_window',
                    detail: 'get_handle_window()',
                    docs: 'DOC?',
                    insert: 'get_handle_window()'
                },
                {
                    label: 'get_position',
                    detail: 'get_position()',
                    docs: 'DOC?',
                    insert: 'get_position()'
                },
                {
                    label: 'get_wide_handle',
                    detail: 'get_wide_handle()',
                    docs: 'DOC?',
                    insert: 'get_wide_handle()'
                },
                {
                    label: 'pack1',
                    detail: 'pack1(child, resize, shrink)',
                    docs: 'DOC?',
                    insert: 'pack1($1)'
                },
                {
                    label: 'pack2',
                    detail: 'pack2(child, resize, shrink)',
                    docs: 'DOC?',
                    insert: 'pack2($1)'
                },
                {
                    label: 'set_position',
                    detail: 'set_position(position)',
                    docs: 'DOC?',
                    insert: 'set_position($1)'
                },
                {
                    label: 'set_wide_handle',
                    detail: 'set_wide_handle(wide)',
                    docs: 'DOC?',
                    insert: 'set_wide_handle($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkPlacesSidebar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'add_shortcut',
                    detail: 'add_shortcut(location)',
                    docs: 'DOC?',
                    insert: 'add_shortcut($1)'
                },
                {
                    label: 'get_local_only',
                    detail: 'get_local_only()',
                    docs: 'DOC?',
                    insert: 'get_local_only()'
                },
                {
                    label: 'get_location',
                    detail: 'get_location()',
                    docs: 'DOC?',
                    insert: 'get_location()'
                },
                {
                    label: 'get_nth_bookmark',
                    detail: 'get_nth_bookmark(n)',
                    docs: 'DOC?',
                    insert: 'get_nth_bookmark($1)'
                },
                {
                    label: 'get_open_flags',
                    detail: 'get_open_flags()',
                    docs: 'DOC?',
                    insert: 'get_open_flags()'
                },
                {
                    label: 'get_show_connect_to_server',
                    detail: 'get_show_connect_to_server()',
                    docs: 'DOC?',
                    insert: 'get_show_connect_to_server()'
                },
                {
                    label: 'get_show_desktop',
                    detail: 'get_show_desktop()',
                    docs: 'DOC?',
                    insert: 'get_show_desktop()'
                },
                {
                    label: 'get_show_enter_location',
                    detail: 'get_show_enter_location()',
                    docs: 'DOC?',
                    insert: 'get_show_enter_location()'
                },
                {
                    label: 'get_show_other_locations',
                    detail: 'get_show_other_locations()',
                    docs: 'DOC?',
                    insert: 'get_show_other_locations()'
                },
                {
                    label: 'get_show_recent',
                    detail: 'get_show_recent()',
                    docs: 'DOC?',
                    insert: 'get_show_recent()'
                },
                {
                    label: 'get_show_starred_location',
                    detail: 'get_show_starred_location()',
                    docs: 'DOC?',
                    insert: 'get_show_starred_location()'
                },
                {
                    label: 'get_show_trash',
                    detail: 'get_show_trash()',
                    docs: 'DOC?',
                    insert: 'get_show_trash()'
                },
                {
                    label: 'list_shortcuts',
                    detail: 'list_shortcuts()',
                    docs: 'DOC?',
                    insert: 'list_shortcuts()'
                },
                {
                    label: 'remove_shortcut',
                    detail: 'remove_shortcut(location)',
                    docs: 'DOC?',
                    insert: 'remove_shortcut($1)'
                },
                {
                    label: 'set_drop_targets_visible',
                    detail: 'set_drop_targets_visible(visible, context)',
                    docs: 'DOC?',
                    insert: 'set_drop_targets_visible($1)'
                },
                {
                    label: 'set_local_only',
                    detail: 'set_local_only(local_only)',
                    docs: 'DOC?',
                    insert: 'set_local_only($1)'
                },
                {
                    label: 'set_location',
                    detail: 'set_location(location)',
                    docs: 'DOC?',
                    insert: 'set_location($1)'
                },
                {
                    label: 'set_open_flags',
                    detail: 'set_open_flags(flags)',
                    docs: 'DOC?',
                    insert: 'set_open_flags($1)'
                },
                {
                    label: 'set_show_connect_to_server',
                    detail: 'set_show_connect_to_server(show_connect_to_server)',
                    docs: 'DOC?',
                    insert: 'set_show_connect_to_server($1)'
                },
                {
                    label: 'set_show_desktop',
                    detail: 'set_show_desktop(show_desktop)',
                    docs: 'DOC?',
                    insert: 'set_show_desktop($1)'
                },
                {
                    label: 'set_show_enter_location',
                    detail: 'set_show_enter_location(show_enter_location)',
                    docs: 'DOC?',
                    insert: 'set_show_enter_location($1)'
                },
                {
                    label: 'set_show_other_locations',
                    detail: 'set_show_other_locations(show_other_locations)',
                    docs: 'DOC?',
                    insert: 'set_show_other_locations($1)'
                },
                {
                    label: 'set_show_recent',
                    detail: 'set_show_recent(show_recent)',
                    docs: 'DOC?',
                    insert: 'set_show_recent($1)'
                },
                {
                    label: 'set_show_starred_location',
                    detail: 'set_show_starred_location(show_starred_location)',
                    docs: 'DOC?',
                    insert: 'set_show_starred_location($1)'
                },
                {
                    label: 'set_show_trash',
                    detail: 'set_show_trash(show_trash)',
                    docs: 'DOC?',
                    insert: 'set_show_trash($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkScrolledWindow = [
                {
                    label: 'new',
                    detail: 'new(hadjustment, vadjustment)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'add_with_viewport',
                    detail: 'add_with_viewport(child)',
                    docs: 'DOC?',
                    insert: 'add_with_viewport($1)'
                },
                {
                    label: 'get_capture_button_press',
                    detail: 'get_capture_button_press()',
                    docs: 'DOC?',
                    insert: 'get_capture_button_press()'
                },
                {
                    label: 'get_hadjustment',
                    detail: 'get_hadjustment()',
                    docs: 'DOC?',
                    insert: 'get_hadjustment()'
                },
                {
                    label: 'get_hscrollbar',
                    detail: 'get_hscrollbar()',
                    docs: 'DOC?',
                    insert: 'get_hscrollbar()'
                },
                {
                    label: 'get_kinetic_scrolling',
                    detail: 'get_kinetic_scrolling()',
                    docs: 'DOC?',
                    insert: 'get_kinetic_scrolling()'
                },
                {
                    label: 'get_max_content_height',
                    detail: 'get_max_content_height()',
                    docs: 'DOC?',
                    insert: 'get_max_content_height()'
                },
                {
                    label: 'get_max_content_width',
                    detail: 'get_max_content_width()',
                    docs: 'DOC?',
                    insert: 'get_max_content_width()'
                },
                {
                    label: 'get_min_content_height',
                    detail: 'get_min_content_height()',
                    docs: 'DOC?',
                    insert: 'get_min_content_height()'
                },
                {
                    label: 'get_min_content_width',
                    detail: 'get_min_content_width()',
                    docs: 'DOC?',
                    insert: 'get_min_content_width()'
                },
                {
                    label: 'get_overlay_scrolling',
                    detail: 'get_overlay_scrolling()',
                    docs: 'DOC?',
                    insert: 'get_overlay_scrolling()'
                },
                {
                    label: 'get_placement',
                    detail: 'get_placement()',
                    docs: 'DOC?',
                    insert: 'get_placement()'
                },
                {
                    label: 'get_policy',
                    detail: 'get_policy()',
                    docs: 'DOC?',
                    insert: 'get_policy()'
                },
                {
                    label: 'get_propagate_natural_height',
                    detail: 'get_propagate_natural_height()',
                    docs: 'DOC?',
                    insert: 'get_propagate_natural_height()'
                },
                {
                    label: 'get_propagate_natural_width',
                    detail: 'get_propagate_natural_width()',
                    docs: 'DOC?',
                    insert: 'get_propagate_natural_width()'
                },
                {
                    label: 'get_shadow_type',
                    detail: 'get_shadow_type()',
                    docs: 'DOC?',
                    insert: 'get_shadow_type()'
                },
                {
                    label: 'get_vadjustment',
                    detail: 'get_vadjustment()',
                    docs: 'DOC?',
                    insert: 'get_vadjustment()'
                },
                {
                    label: 'get_vscrollbar',
                    detail: 'get_vscrollbar()',
                    docs: 'DOC?',
                    insert: 'get_vscrollbar()'
                },
                {
                    label: 'set_capture_button_press',
                    detail: 'set_capture_button_press(capture_button_press)',
                    docs: 'DOC?',
                    insert: 'set_capture_button_press($1)'
                },
                {
                    label: 'set_hadjustment',
                    detail: 'set_hadjustment(hadjustment)',
                    docs: 'DOC?',
                    insert: 'set_hadjustment($1)'
                },
                {
                    label: 'set_kinetic_scrolling',
                    detail: 'set_kinetic_scrolling(kinetic_scrolling)',
                    docs: 'DOC?',
                    insert: 'set_kinetic_scrolling($1)'
                },
                {
                    label: 'set_max_content_height',
                    detail: 'set_max_content_height(height)',
                    docs: 'DOC?',
                    insert: 'set_max_content_height($1)'
                },
                {
                    label: 'set_max_content_width',
                    detail: 'set_max_content_width(width)',
                    docs: 'DOC?',
                    insert: 'set_max_content_width($1)'
                },
                {
                    label: 'set_min_content_height',
                    detail: 'set_min_content_height(height)',
                    docs: 'DOC?',
                    insert: 'set_min_content_height($1)'
                },
                {
                    label: 'set_min_content_width',
                    detail: 'set_min_content_width(width)',
                    docs: 'DOC?',
                    insert: 'set_min_content_width($1)'
                },
                {
                    label: 'set_overlay_scrolling',
                    detail: 'set_overlay_scrolling(overlay_scrolling)',
                    docs: 'DOC?',
                    insert: 'set_overlay_scrolling($1)'
                },
                {
                    label: 'set_placement',
                    detail: 'set_placement(window_placement)',
                    docs: 'DOC?',
                    insert: 'set_placement($1)'
                },
                {
                    label: 'set_policy',
                    detail: 'set_policy(hscrollbar_policy, vscrollbar_policy)',
                    docs: 'DOC?',
                    insert: 'set_policy($1)'
                },
                {
                    label: 'set_propagate_natural_height',
                    detail: 'set_propagate_natural_height(propagate)',
                    docs: 'DOC?',
                    insert: 'set_propagate_natural_height($1)'
                },
                {
                    label: 'set_propagate_natural_width',
                    detail: 'set_propagate_natural_width(propagate)',
                    docs: 'DOC?',
                    insert: 'set_propagate_natural_width($1)'
                },
                {
                    label: 'set_shadow_type',
                    detail: 'set_shadow_type(type)',
                    docs: 'DOC?',
                    insert: 'set_shadow_type($1)'
                },
                {
                    label: 'set_vadjustment',
                    detail: 'set_vadjustment(vadjustment)',
                    docs: 'DOC?',
                    insert: 'set_vadjustment($1)'
                },
                {
                    label: 'unset_placement',
                    detail: 'unset_placement()',
                    docs: 'DOC?',
                    insert: 'unset_placement()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkProgressBar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'get_ellipsize',
                    detail: 'get_ellipsize()',
                    docs: 'DOC?',
                    insert: 'get_ellipsize()'
                },
                {
                    label: 'get_fraction',
                    detail: 'get_fraction()',
                    docs: 'DOC?',
                    insert: 'get_fraction()'
                },
                {
                    label: 'get_inverted',
                    detail: 'get_inverted()',
                    docs: 'DOC?',
                    insert: 'get_inverted()'
                },
                {
                    label: 'get_pulse_step',
                    detail: 'get_pulse_step()',
                    docs: 'DOC?',
                    insert: 'get_pulse_step()'
                },
                {
                    label: 'get_show_text',
                    detail: 'get_show_text()',
                    docs: 'DOC?',
                    insert: 'get_show_text()'
                },
                {
                    label: 'get_text',
                    detail: 'get_text()',
                    docs: 'DOC?',
                    insert: 'get_text()'
                },
                {
                    label: 'pulse',
                    detail: 'pulse()',
                    docs: 'DOC?',
                    insert: 'pulse()'
                },
                {
                    label: 'set_ellipsize',
                    detail: 'set_ellipsize(mode)',
                    docs: 'DOC?',
                    insert: 'set_ellipsize($1)'
                },
                {
                    label: 'set_fraction',
                    detail: 'set_fraction(fraction)',
                    docs: 'DOC?',
                    insert: 'set_fraction($1)'
                },
                {
                    label: 'set_inverted',
                    detail: 'set_inverted(inverted)',
                    docs: 'DOC?',
                    insert: 'set_inverted($1)'
                },
                {
                    label: 'set_pulse_step',
                    detail: 'set_pulse_step(fraction)',
                    docs: 'DOC?',
                    insert: 'set_pulse_step($1)'
                },
                {
                    label: 'set_show_text',
                    detail: 'set_show_text(show_text)',
                    docs: 'DOC?',
                    insert: 'set_show_text($1)'
                },
                {
                    label: 'set_text',
                    detail: 'set_text(text)',
                    docs: 'DOC?',
                    insert: 'set_text($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkRadioButton = [
                {
                    label: 'new',
                    detail: 'new(group)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'new_from_widget',
                    detail: 'new_from_widget(radio_group_member)',
                    docs: 'DOC?',
                    insert: 'new_from_widget($1)'
                },
                {
                    label: 'new_with_label',
                    detail: 'new_with_label(group, label)',
                    docs: 'DOC?',
                    insert: 'new_with_label($1)'
                },
                {
                    label: 'new_with_label_from_widget',
                    detail: 'new_with_label_from_widget(radio_group_member, label)',
                    docs: 'DOC?',
                    insert: 'new_with_label_from_widget($1)'
                },
                {
                    label: 'new_with_mnemonic',
                    detail: 'new_with_mnemonic(group, label)',
                    docs: 'DOC?',
                    insert: 'new_with_mnemonic($1)'
                },
                {
                    label: 'new_with_mnemonic_from_widget',
                    detail: 'new_with_mnemonic_from_widget(radio_group_member, label)',
                    docs: 'DOC?',
                    insert: 'new_with_mnemonic_from_widget($1)'
                },
                {
                    label: 'get_group',
                    detail: 'get_group()',
                    docs: 'DOC?',
                    insert: 'get_group()'
                },
                {
                    label: 'join_group',
                    detail: 'join_group(group_source)',
                    docs: 'DOC?',
                    insert: 'join_group($1)'
                },
                {
                    label: 'set_group',
                    detail: 'set_group(group)',
                    docs: 'DOC?',
                    insert: 'set_group($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkRecentChooser = [
                {
                    label: 'add_filter',
                    detail: 'add_filter(filter)',
                    docs: 'DOC?',
                    insert: 'add_filter($1)'
                },
                {
                    label: 'get_current_item',
                    detail: 'get_current_item()',
                    docs: 'DOC?',
                    insert: 'get_current_item()'
                },
                {
                    label: 'get_current_uri',
                    detail: 'get_current_uri()',
                    docs: 'DOC?',
                    insert: 'get_current_uri()'
                },
                {
                    label: 'get_filter',
                    detail: 'get_filter()',
                    docs: 'DOC?',
                    insert: 'get_filter()'
                },
                {
                    label: 'get_items',
                    detail: 'get_items()',
                    docs: 'DOC?',
                    insert: 'get_items()'
                },
                {
                    label: 'get_limit',
                    detail: 'get_limit()',
                    docs: 'DOC?',
                    insert: 'get_limit()'
                },
                {
                    label: 'get_local_only',
                    detail: 'get_local_only()',
                    docs: 'DOC?',
                    insert: 'get_local_only()'
                },
                {
                    label: 'get_select_multiple',
                    detail: 'get_select_multiple()',
                    docs: 'DOC?',
                    insert: 'get_select_multiple()'
                },
                {
                    label: 'get_show_icons',
                    detail: 'get_show_icons()',
                    docs: 'DOC?',
                    insert: 'get_show_icons()'
                },
                {
                    label: 'get_show_not_found',
                    detail: 'get_show_not_found()',
                    docs: 'DOC?',
                    insert: 'get_show_not_found()'
                },
                {
                    label: 'get_show_private',
                    detail: 'get_show_private()',
                    docs: 'DOC?',
                    insert: 'get_show_private()'
                },
                {
                    label: 'get_show_tips',
                    detail: 'get_show_tips()',
                    docs: 'DOC?',
                    insert: 'get_show_tips()'
                },
                {
                    label: 'get_sort_type',
                    detail: 'get_sort_type()',
                    docs: 'DOC?',
                    insert: 'get_sort_type()'
                },
                {
                    label: 'get_uris',
                    detail: 'get_uris()',
                    docs: 'DOC?',
                    insert: 'get_uris()'
                },
                {
                    label: 'list_filters',
                    detail: 'list_filters()',
                    docs: 'DOC?',
                    insert: 'list_filters()'
                },
                {
                    label: 'remove_filter',
                    detail: 'remove_filter(filter)',
                    docs: 'DOC?',
                    insert: 'remove_filter($1)'
                },
                {
                    label: 'select_all',
                    detail: 'select_all()',
                    docs: 'DOC?',
                    insert: 'select_all()'
                },
                {
                    label: 'select_uri',
                    detail: 'select_uri(uri)',
                    docs: 'DOC?',
                    insert: 'select_uri($1)'
                },
                {
                    label: 'set_current_uri',
                    detail: 'set_current_uri(uri)',
                    docs: 'DOC?',
                    insert: 'set_current_uri($1)'
                },
                {
                    label: 'set_filter',
                    detail: 'set_filter(filter)',
                    docs: 'DOC?',
                    insert: 'set_filter($1)'
                },
                {
                    label: 'set_limit',
                    detail: 'set_limit(limit)',
                    docs: 'DOC?',
                    insert: 'set_limit($1)'
                },
                {
                    label: 'set_local_only',
                    detail: 'set_local_only(local_only)',
                    docs: 'DOC?',
                    insert: 'set_local_only($1)'
                },
                {
                    label: 'set_select_multiple',
                    detail: 'set_select_multiple(select_multiple)',
                    docs: 'DOC?',
                    insert: 'set_select_multiple($1)'
                },
                {
                    label: 'set_show_icons',
                    detail: 'set_show_icons(show_icons)',
                    docs: 'DOC?',
                    insert: 'set_show_icons($1)'
                },
                {
                    label: 'set_show_not_found',
                    detail: 'set_show_not_found(show_not_found)',
                    docs: 'DOC?',
                    insert: 'set_show_not_found($1)'
                },
                {
                    label: 'set_show_private',
                    detail: 'set_show_private(show_private)',
                    docs: 'DOC?',
                    insert: 'set_show_private($1)'
                },
                {
                    label: 'set_show_tips',
                    detail: 'set_show_tips(show_tips)',
                    docs: 'DOC?',
                    insert: 'set_show_tips($1)'
                },
                {
                    label: 'set_sort_func',
                    detail: 'set_sort_func(sort_func, *sort_data)',
                    docs: 'DOC?',
                    insert: 'set_sort_func($1)'
                },
                {
                    label: 'set_sort_type',
                    detail: 'set_sort_type(sort_type)',
                    docs: 'DOC?',
                    insert: 'set_sort_type($1)'
                },
                {
                    label: 'unselect_all',
                    detail: 'unselect_all()',
                    docs: 'DOC?',
                    insert: 'unselect_all()'
                },
                {
                    label: 'unselect_uri',
                    detail: 'unselect_uri(uri)',
                    docs: 'DOC?',
                    insert: 'unselect_uri($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkScale = [
                {
                    label: 'new',
                    detail: 'new(orientation, adjustment)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'new_with_range',
                    detail: 'new_with_range(orientation, min, max, step)',
                    docs: 'DOC?',
                    insert: 'new_with_range($1)'
                },
                {
                    label: 'add_mark',
                    detail: 'add_mark(value, position, markup)',
                    docs: 'DOC?',
                    insert: 'add_mark($1)'
                },
                {
                    label: 'clear_marks',
                    detail: 'clear_marks()',
                    docs: 'DOC?',
                    insert: 'clear_marks()'
                },
                {
                    label: 'get_digits',
                    detail: 'get_digits()',
                    docs: 'DOC?',
                    insert: 'get_digits()'
                },
                {
                    label: 'get_draw_value',
                    detail: 'get_draw_value()',
                    docs: 'DOC?',
                    insert: 'get_draw_value()'
                },
                {
                    label: 'get_has_origin',
                    detail: 'get_has_origin()',
                    docs: 'DOC?',
                    insert: 'get_has_origin()'
                },
                {
                    label: 'get_layout',
                    detail: 'get_layout()',
                    docs: 'DOC?',
                    insert: 'get_layout()'
                },
                {
                    label: 'get_layout_offsets',
                    detail: 'get_layout_offsets()',
                    docs: 'DOC?',
                    insert: 'get_layout_offsets()'
                },
                {
                    label: 'get_value_pos',
                    detail: 'get_value_pos()',
                    docs: 'DOC?',
                    insert: 'get_value_pos()'
                },
                {
                    label: 'set_digits',
                    detail: 'set_digits(digits)',
                    docs: 'DOC?',
                    insert: 'set_digits($1)'
                },
                {
                    label: 'set_draw_value',
                    detail: 'set_draw_value(draw_value)',
                    docs: 'DOC?',
                    insert: 'set_draw_value($1)'
                },
                {
                    label: 'set_has_origin',
                    detail: 'set_has_origin(has_origin)',
                    docs: 'DOC?',
                    insert: 'set_has_origin($1)'
                },
                {
                    label: 'set_value_pos',
                    detail: 'set_value_pos(pos)',
                    docs: 'DOC?',
                    insert: 'set_value_pos($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkRange = [
                {
                    label: 'get_adjustment',
                    detail: 'get_adjustment()',
                    docs: 'DOC?',
                    insert: 'get_adjustment()'
                },
                {
                    label: 'get_fill_level',
                    detail: 'get_fill_level()',
                    docs: 'DOC?',
                    insert: 'get_fill_level()'
                },
                {
                    label: 'get_flippable',
                    detail: 'get_flippable()',
                    docs: 'DOC?',
                    insert: 'get_flippable()'
                },
                {
                    label: 'get_inverted',
                    detail: 'get_inverted()',
                    docs: 'DOC?',
                    insert: 'get_inverted()'
                },
                {
                    label: 'get_lower_stepper_sensitivity',
                    detail: 'get_lower_stepper_sensitivity()',
                    docs: 'DOC?',
                    insert: 'get_lower_stepper_sensitivity()'
                },
                {
                    label: 'get_min_slider_size',
                    detail: 'get_min_slider_size()',
                    docs: 'DOC?',
                    insert: 'get_min_slider_size()'
                },
                {
                    label: 'get_range_rect',
                    detail: 'get_range_rect()',
                    docs: 'DOC?',
                    insert: 'get_range_rect()'
                },
                {
                    label: 'get_restrict_to_fill_level',
                    detail: 'get_restrict_to_fill_level()',
                    docs: 'DOC?',
                    insert: 'get_restrict_to_fill_level()'
                },
                {
                    label: 'get_round_digits',
                    detail: 'get_round_digits()',
                    docs: 'DOC?',
                    insert: 'get_round_digits()'
                },
                {
                    label: 'get_show_fill_level',
                    detail: 'get_show_fill_level()',
                    docs: 'DOC?',
                    insert: 'get_show_fill_level()'
                },
                {
                    label: 'get_slider_range',
                    detail: 'get_slider_range()',
                    docs: 'DOC?',
                    insert: 'get_slider_range()'
                },
                {
                    label: 'get_slider_size_fixed',
                    detail: 'get_slider_size_fixed()',
                    docs: 'DOC?',
                    insert: 'get_slider_size_fixed()'
                },
                {
                    label: 'get_upper_stepper_sensitivity',
                    detail: 'get_upper_stepper_sensitivity()',
                    docs: 'DOC?',
                    insert: 'get_upper_stepper_sensitivity()'
                },
                {
                    label: 'get_value',
                    detail: 'get_value()',
                    docs: 'DOC?',
                    insert: 'get_value()'
                },
                {
                    label: 'set_adjustment',
                    detail: 'set_adjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_adjustment($1)'
                },
                {
                    label: 'set_fill_level',
                    detail: 'set_fill_level(fill_level)',
                    docs: 'DOC?',
                    insert: 'set_fill_level($1)'
                },
                {
                    label: 'set_flippable',
                    detail: 'set_flippable(flippable)',
                    docs: 'DOC?',
                    insert: 'set_flippable($1)'
                },
                {
                    label: 'set_increments',
                    detail: 'set_increments(step, page)',
                    docs: 'DOC?',
                    insert: 'set_increments($1)'
                },
                {
                    label: 'set_inverted',
                    detail: 'set_inverted(setting)',
                    docs: 'DOC?',
                    insert: 'set_inverted($1)'
                },
                {
                    label: 'set_lower_stepper_sensitivity',
                    detail: 'set_lower_stepper_sensitivity(sensitivity)',
                    docs: 'DOC?',
                    insert: 'set_lower_stepper_sensitivity($1)'
                },
                {
                    label: 'set_min_slider_size',
                    detail: 'set_min_slider_size(min_size)',
                    docs: 'DOC?',
                    insert: 'set_min_slider_size($1)'
                },
                {
                    label: 'set_range',
                    detail: 'set_range(min, max)',
                    docs: 'DOC?',
                    insert: 'set_range($1)'
                },
                {
                    label: 'set_restrict_to_fill_level',
                    detail: 'set_restrict_to_fill_level(restrict_to_fill_level)',
                    docs: 'DOC?',
                    insert: 'set_restrict_to_fill_level($1)'
                },
                {
                    label: 'set_round_digits',
                    detail: 'set_round_digits(round_digits)',
                    docs: 'DOC?',
                    insert: 'set_round_digits($1)'
                },
                {
                    label: 'set_show_fill_level',
                    detail: 'set_show_fill_level(show_fill_level)',
                    docs: 'DOC?',
                    insert: 'set_show_fill_level($1)'
                },
                {
                    label: 'set_slider_size_fixed',
                    detail: 'set_slider_size_fixed(size_fixed)',
                    docs: 'DOC?',
                    insert: 'set_slider_size_fixed($1)'
                },
                {
                    label: 'set_upper_stepper_sensitivity',
                    detail: 'set_upper_stepper_sensitivity(sensitivity)',
                    docs: 'DOC?',
                    insert: 'set_upper_stepper_sensitivity($1)'
                },
                {
                    label: 'set_value',
                    detail: 'set_value(value)',
                    docs: 'DOC?',
                    insert: 'set_value($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkSearchBar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'connect_entry',
                    detail: 'connect_entry(entry)',
                    docs: 'DOC?',
                    insert: 'connect_entry($1)'
                },
                {
                    label: 'get_search_mode',
                    detail: 'get_search_mode()',
                    docs: 'DOC?',
                    insert: 'get_search_mode()'
                },
                {
                    label: 'get_show_close_button',
                    detail: 'get_show_close_button()',
                    docs: 'DOC?',
                    insert: 'get_show_close_button()'
                },
                {
                    label: 'handle_event',
                    detail: 'handle_event(event)',
                    docs: 'DOC?',
                    insert: 'handle_event($1)'
                },
                {
                    label: 'set_search_mode',
                    detail: 'set_search_mode(search_mode)',
                    docs: 'DOC?',
                    insert: 'set_search_mode($1)'
                },
                {
                    label: 'set_show_close_button',
                    detail: 'set_show_close_button(visible)',
                    docs: 'DOC?',
                    insert: 'set_show_close_button($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkSearchEntry = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'handle_event',
                    detail: 'handle_event(event)',
                    docs: 'DOC?',
                    insert: 'handle_event($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkSpinButton = [
                {
                    label: 'new',
                    detail: 'new(adjustment, climb_rate, digits)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'new_with_range',
                    detail: 'new_with_range(min, max, step)',
                    docs: 'DOC?',
                    insert: 'new_with_range($1)'
                },
                {
                    label: 'configure',
                    detail: 'configure(adjustment, climb_rate, digits)',
                    docs: 'DOC?',
                    insert: 'configure($1)'
                },
                {
                    label: 'get_adjustment',
                    detail: 'get_adjustment()',
                    docs: 'DOC?',
                    insert: 'get_adjustment()'
                },
                {
                    label: 'get_digits',
                    detail: 'get_digits()',
                    docs: 'DOC?',
                    insert: 'get_digits()'
                },
                {
                    label: 'get_increments',
                    detail: 'get_increments()',
                    docs: 'DOC?',
                    insert: 'get_increments()'
                },
                {
                    label: 'get_numeric',
                    detail: 'get_numeric()',
                    docs: 'DOC?',
                    insert: 'get_numeric()'
                },
                {
                    label: 'get_range',
                    detail: 'get_range()',
                    docs: 'DOC?',
                    insert: 'get_range()'
                },
                {
                    label: 'get_snap_to_ticks',
                    detail: 'get_snap_to_ticks()',
                    docs: 'DOC?',
                    insert: 'get_snap_to_ticks()'
                },
                {
                    label: 'get_update_policy',
                    detail: 'get_update_policy()',
                    docs: 'DOC?',
                    insert: 'get_update_policy()'
                },
                {
                    label: 'get_value',
                    detail: 'get_value()',
                    docs: 'DOC?',
                    insert: 'get_value()'
                },
                {
                    label: 'get_value_as_int',
                    detail: 'get_value_as_int()',
                    docs: 'DOC?',
                    insert: 'get_value_as_int()'
                },
                {
                    label: 'get_wrap',
                    detail: 'get_wrap()',
                    docs: 'DOC?',
                    insert: 'get_wrap()'
                },
                {
                    label: 'set_adjustment',
                    detail: 'set_adjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_adjustment($1)'
                },
                {
                    label: 'set_digits',
                    detail: 'set_digits(digits)',
                    docs: 'DOC?',
                    insert: 'set_digits($1)'
                },
                {
                    label: 'set_increments',
                    detail: 'set_increments(step, page)',
                    docs: 'DOC?',
                    insert: 'set_increments($1)'
                },
                {
                    label: 'set_numeric',
                    detail: 'set_numeric(numeric)',
                    docs: 'DOC?',
                    insert: 'set_numeric($1)'
                },
                {
                    label: 'set_range',
                    detail: 'set_range(min, max)',
                    docs: 'DOC?',
                    insert: 'set_range($1)'
                },
                {
                    label: 'set_snap_to_ticks',
                    detail: 'set_snap_to_ticks(snap_to_ticks)',
                    docs: 'DOC?',
                    insert: 'set_snap_to_ticks($1)'
                },
                {
                    label: 'set_update_policy',
                    detail: 'set_update_policy(policy)',
                    docs: 'DOC?',
                    insert: 'set_update_policy($1)'
                },
                {
                    label: 'set_value',
                    detail: 'set_value(value)',
                    docs: 'DOC?',
                    insert: 'set_value($1)'
                },
                {
                    label: 'set_wrap',
                    detail: 'set_wrap(wrap)',
                    docs: 'DOC?',
                    insert: 'set_wrap($1)'
                },
                {
                    label: 'spin',
                    detail: 'spin(direction, increment)',
                    docs: 'DOC?',
                    insert: 'spin($1)'
                },
                {
                    label: 'update',
                    detail: 'update()',
                    docs: 'DOC?',
                    insert: 'update()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkStack = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'add_named',
                    detail: 'add_named(child, name)',
                    docs: 'DOC?',
                    insert: 'add_named($1)'
                },
                {
                    label: 'add_titled',
                    detail: 'add_titled(child, name, title)',
                    docs: 'DOC?',
                    insert: 'add_titled($1)'
                },
                {
                    label: 'get_child_by_name',
                    detail: 'get_child_by_name(name)',
                    docs: 'DOC?',
                    insert: 'get_child_by_name($1)'
                },
                {
                    label: 'get_hhomogeneous',
                    detail: 'get_hhomogeneous()',
                    docs: 'DOC?',
                    insert: 'get_hhomogeneous()'
                },
                {
                    label: 'get_homogeneous',
                    detail: 'get_homogeneous()',
                    docs: 'DOC?',
                    insert: 'get_homogeneous()'
                },
                {
                    label: 'get_interpolate_size',
                    detail: 'get_interpolate_size()',
                    docs: 'DOC?',
                    insert: 'get_interpolate_size()'
                },
                {
                    label: 'get_transition_duration',
                    detail: 'get_transition_duration()',
                    docs: 'DOC?',
                    insert: 'get_transition_duration()'
                },
                {
                    label: 'get_transition_running',
                    detail: 'get_transition_running()',
                    docs: 'DOC?',
                    insert: 'get_transition_running()'
                },
                {
                    label: 'get_transition_type',
                    detail: 'get_transition_type()',
                    docs: 'DOC?',
                    insert: 'get_transition_type()'
                },
                {
                    label: 'get_vhomogeneous',
                    detail: 'get_vhomogeneous()',
                    docs: 'DOC?',
                    insert: 'get_vhomogeneous()'
                },
                {
                    label: 'get_visible_child',
                    detail: 'get_visible_child()',
                    docs: 'DOC?',
                    insert: 'get_visible_child()'
                },
                {
                    label: 'get_visible_child_name',
                    detail: 'get_visible_child_name()',
                    docs: 'DOC?',
                    insert: 'get_visible_child_name()'
                },
                {
                    label: 'set_hhomogeneous',
                    detail: 'set_hhomogeneous(hhomogeneous)',
                    docs: 'DOC?',
                    insert: 'set_hhomogeneous($1)'
                },
                {
                    label: 'set_homogeneous',
                    detail: 'set_homogeneous(homogeneous)',
                    docs: 'DOC?',
                    insert: 'set_homogeneous($1)'
                },
                {
                    label: 'set_interpolate_size',
                    detail: 'set_interpolate_size(interpolate_size)',
                    docs: 'DOC?',
                    insert: 'set_interpolate_size($1)'
                },
                {
                    label: 'set_transition_duration',
                    detail: 'set_transition_duration(duration)',
                    docs: 'DOC?',
                    insert: 'set_transition_duration($1)'
                },
                {
                    label: 'set_transition_type',
                    detail: 'set_transition_type(transition)',
                    docs: 'DOC?',
                    insert: 'set_transition_type($1)'
                },
                {
                    label: 'set_vhomogeneous',
                    detail: 'set_vhomogeneous(vhomogeneous)',
                    docs: 'DOC?',
                    insert: 'set_vhomogeneous($1)'
                },
                {
                    label: 'set_visible_child',
                    detail: 'set_visible_child(child)',
                    docs: 'DOC?',
                    insert: 'set_visible_child($1)'
                },
                {
                    label: 'set_visible_child_full',
                    detail: 'set_visible_child_full(name, transition)',
                    docs: 'DOC?',
                    insert: 'set_visible_child_full($1)'
                },
                {
                    label: 'set_visible_child_name',
                    detail: 'set_visible_child_name(name)',
                    docs: 'DOC?',
                    insert: 'set_visible_child_name($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkStatusbar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'get_context_id',
                    detail: 'get_context_id(context_description)',
                    docs: 'DOC?',
                    insert: 'get_context_id($1)'
                },
                {
                    label: 'get_message_area',
                    detail: 'get_message_area()',
                    docs: 'DOC?',
                    insert: 'get_message_area()'
                },
                {
                    label: 'pop',
                    detail: 'pop(context_id)',
                    docs: 'DOC?',
                    insert: 'pop($1)'
                },
                {
                    label: 'push',
                    detail: 'push(context_id, text)',
                    docs: 'DOC?',
                    insert: 'push($1)'
                },
                {
                    label: 'remove',
                    detail: 'remove(context_id, message_id)',
                    docs: 'DOC?',
                    insert: 'remove($1)'
                },
                {
                    label: 'remove_all',
                    detail: 'remove_all(context_id)',
                    docs: 'DOC?',
                    insert: 'remove_all($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkTextView = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_with_buffer',
                    detail: 'new_with_buffer(buffer)',
                    docs: 'DOC?',
                    insert: 'new_with_buffer($1)'
                },
                {
                    label: 'add_child_at_anchor',
                    detail: 'add_child_at_anchor(child, anchor)',
                    docs: 'DOC?',
                    insert: 'add_child_at_anchor($1)'
                },
                {
                    label: 'add_child_in_window',
                    detail: 'add_child_in_window(child, which_window, xpos, ypos)',
                    docs: 'DOC?',
                    insert: 'add_child_in_window($1)'
                },
                {
                    label: 'backward_display_line',
                    detail: 'backward_display_line(iter)',
                    docs: 'DOC?',
                    insert: 'backward_display_line($1)'
                },
                {
                    label: 'backward_display_line_start',
                    detail: 'backward_display_line_start(iter)',
                    docs: 'DOC?',
                    insert: 'backward_display_line_start($1)'
                },
                {
                    label: 'buffer_to_window_coords',
                    detail: 'buffer_to_window_coords(win, buffer_x, buffer_y)',
                    docs: 'DOC?',
                    insert: 'buffer_to_window_coords($1)'
                },
                {
                    label: 'forward_display_line',
                    detail: 'forward_display_line(iter)',
                    docs: 'DOC?',
                    insert: 'forward_display_line($1)'
                },
                {
                    label: 'forward_display_line_end',
                    detail: 'forward_display_line_end(iter)',
                    docs: 'DOC?',
                    insert: 'forward_display_line_end($1)'
                },
                {
                    label: 'get_accepts_tab',
                    detail: 'get_accepts_tab()',
                    docs: 'DOC?',
                    insert: 'get_accepts_tab()'
                },
                {
                    label: 'get_border_window_size',
                    detail: 'get_border_window_size(type)',
                    docs: 'DOC?',
                    insert: 'get_border_window_size($1)'
                },
                {
                    label: 'get_bottom_margin',
                    detail: 'get_bottom_margin()',
                    docs: 'DOC?',
                    insert: 'get_bottom_margin()'
                },
                {
                    label: 'get_buffer',
                    detail: 'get_buffer()',
                    docs: 'DOC?',
                    insert: 'get_buffer()'
                },
                {
                    label: 'get_cursor_locations',
                    detail: 'get_cursor_locations(iter)',
                    docs: 'DOC?',
                    insert: 'get_cursor_locations($1)'
                },
                {
                    label: 'get_cursor_visible',
                    detail: 'get_cursor_visible()',
                    docs: 'DOC?',
                    insert: 'get_cursor_visible()'
                },
                {
                    label: 'get_default_attributes',
                    detail: 'get_default_attributes()',
                    docs: 'DOC?',
                    insert: 'get_default_attributes()'
                },
                {
                    label: 'get_editable',
                    detail: 'get_editable()',
                    docs: 'DOC?',
                    insert: 'get_editable()'
                },
                {
                    label: 'get_hadjustment',
                    detail: 'get_hadjustment()',
                    docs: 'DOC?',
                    insert: 'get_hadjustment()'
                },
                {
                    label: 'get_indent',
                    detail: 'get_indent()',
                    docs: 'DOC?',
                    insert: 'get_indent()'
                },
                {
                    label: 'get_input_hints',
                    detail: 'get_input_hints()',
                    docs: 'DOC?',
                    insert: 'get_input_hints()'
                },
                {
                    label: 'get_input_purpose',
                    detail: 'get_input_purpose()',
                    docs: 'DOC?',
                    insert: 'get_input_purpose()'
                },
                {
                    label: 'get_iter_at_location',
                    detail: 'get_iter_at_location(x, y)',
                    docs: 'DOC?',
                    insert: 'get_iter_at_location($1)'
                },
                {
                    label: 'get_iter_at_position',
                    detail: 'get_iter_at_position(x, y)',
                    docs: 'DOC?',
                    insert: 'get_iter_at_position($1)'
                },
                {
                    label: 'get_iter_location',
                    detail: 'get_iter_location(iter)',
                    docs: 'DOC?',
                    insert: 'get_iter_location($1)'
                },
                {
                    label: 'get_justification',
                    detail: 'get_justification()',
                    docs: 'DOC?',
                    insert: 'get_justification()'
                },
                {
                    label: 'get_left_margin',
                    detail: 'get_left_margin()',
                    docs: 'DOC?',
                    insert: 'get_left_margin()'
                },
                {
                    label: 'get_line_at_y',
                    detail: 'get_line_at_y(y)',
                    docs: 'DOC?',
                    insert: 'get_line_at_y($1)'
                },
                {
                    label: 'get_line_yrange',
                    detail: 'get_line_yrange(iter)',
                    docs: 'DOC?',
                    insert: 'get_line_yrange($1)'
                },
                {
                    label: 'get_monospace',
                    detail: 'get_monospace()',
                    docs: 'DOC?',
                    insert: 'get_monospace()'
                },
                {
                    label: 'get_overwrite',
                    detail: 'get_overwrite()',
                    docs: 'DOC?',
                    insert: 'get_overwrite()'
                },
                {
                    label: 'get_pixels_above_lines',
                    detail: 'get_pixels_above_lines()',
                    docs: 'DOC?',
                    insert: 'get_pixels_above_lines()'
                },
                {
                    label: 'get_pixels_below_lines',
                    detail: 'get_pixels_below_lines()',
                    docs: 'DOC?',
                    insert: 'get_pixels_below_lines()'
                },
                {
                    label: 'get_pixels_inside_wrap',
                    detail: 'get_pixels_inside_wrap()',
                    docs: 'DOC?',
                    insert: 'get_pixels_inside_wrap()'
                },
                {
                    label: 'get_right_margin',
                    detail: 'get_right_margin()',
                    docs: 'DOC?',
                    insert: 'get_right_margin()'
                },
                {
                    label: 'get_tabs',
                    detail: 'get_tabs()',
                    docs: 'DOC?',
                    insert: 'get_tabs()'
                },
                {
                    label: 'get_top_margin',
                    detail: 'get_top_margin()',
                    docs: 'DOC?',
                    insert: 'get_top_margin()'
                },
                {
                    label: 'get_vadjustment',
                    detail: 'get_vadjustment()',
                    docs: 'DOC?',
                    insert: 'get_vadjustment()'
                },
                {
                    label: 'get_visible_rect',
                    detail: 'get_visible_rect()',
                    docs: 'DOC?',
                    insert: 'get_visible_rect()'
                },
                {
                    label: 'get_window',
                    detail: 'get_window(win)',
                    docs: 'DOC?',
                    insert: 'get_window($1)'
                },
                {
                    label: 'get_window_type',
                    detail: 'get_window_type(window)',
                    docs: 'DOC?',
                    insert: 'get_window_type($1)'
                },
                {
                    label: 'get_wrap_mode',
                    detail: 'get_wrap_mode()',
                    docs: 'DOC?',
                    insert: 'get_wrap_mode()'
                },
                {
                    label: 'im_context_filter_keypress',
                    detail: 'im_context_filter_keypress(event)',
                    docs: 'DOC?',
                    insert: 'im_context_filter_keypress($1)'
                },
                {
                    label: 'move_child',
                    detail: 'move_child(child, xpos, ypos)',
                    docs: 'DOC?',
                    insert: 'move_child($1)'
                },
                {
                    label: 'move_mark_onscreen',
                    detail: 'move_mark_onscreen(mark)',
                    docs: 'DOC?',
                    insert: 'move_mark_onscreen($1)'
                },
                {
                    label: 'move_visually',
                    detail: 'move_visually(iter, count)',
                    docs: 'DOC?',
                    insert: 'move_visually($1)'
                },
                {
                    label: 'place_cursor_onscreen',
                    detail: 'place_cursor_onscreen()',
                    docs: 'DOC?',
                    insert: 'place_cursor_onscreen()'
                },
                {
                    label: 'reset_cursor_blink',
                    detail: 'reset_cursor_blink()',
                    docs: 'DOC?',
                    insert: 'reset_cursor_blink()'
                },
                {
                    label: 'reset_im_context',
                    detail: 'reset_im_context()',
                    docs: 'DOC?',
                    insert: 'reset_im_context()'
                },
                {
                    label: 'scroll_mark_onscreen',
                    detail: 'scroll_mark_onscreen(mark)',
                    docs: 'DOC?',
                    insert: 'scroll_mark_onscreen($1)'
                },
                {
                    label: 'scroll_to_iter',
                    detail: 'scroll_to_iter(iter, within_margin, use_align, xalign, yalign)',
                    docs: 'DOC?',
                    insert: 'scroll_to_iter($1)'
                },
                {
                    label: 'scroll_to_mark',
                    detail: 'scroll_to_mark(mark, within_margin, use_align, xalign, yalign)',
                    docs: 'DOC?',
                    insert: 'scroll_to_mark($1)'
                },
                {
                    label: 'set_accepts_tab',
                    detail: 'set_accepts_tab(accepts_tab)',
                    docs: 'DOC?',
                    insert: 'set_accepts_tab($1)'
                },
                {
                    label: 'set_border_window_size',
                    detail: 'set_border_window_size(type, size)',
                    docs: 'DOC?',
                    insert: 'set_border_window_size($1)'
                },
                {
                    label: 'set_bottom_margin',
                    detail: 'set_bottom_margin(bottom_margin)',
                    docs: 'DOC?',
                    insert: 'set_bottom_margin($1)'
                },
                {
                    label: 'set_buffer',
                    detail: 'set_buffer(buffer)',
                    docs: 'DOC?',
                    insert: 'set_buffer($1)'
                },
                {
                    label: 'set_cursor_visible',
                    detail: 'set_cursor_visible(setting)',
                    docs: 'DOC?',
                    insert: 'set_cursor_visible($1)'
                },
                {
                    label: 'set_editable',
                    detail: 'set_editable(setting)',
                    docs: 'DOC?',
                    insert: 'set_editable($1)'
                },
                {
                    label: 'set_indent',
                    detail: 'set_indent(indent)',
                    docs: 'DOC?',
                    insert: 'set_indent($1)'
                },
                {
                    label: 'set_input_hints',
                    detail: 'set_input_hints(hints)',
                    docs: 'DOC?',
                    insert: 'set_input_hints($1)'
                },
                {
                    label: 'set_input_purpose',
                    detail: 'set_input_purpose(purpose)',
                    docs: 'DOC?',
                    insert: 'set_input_purpose($1)'
                },
                {
                    label: 'set_justification',
                    detail: 'set_justification(justification)',
                    docs: 'DOC?',
                    insert: 'set_justification($1)'
                },
                {
                    label: 'set_left_margin',
                    detail: 'set_left_margin(left_margin)',
                    docs: 'DOC?',
                    insert: 'set_left_margin($1)'
                },
                {
                    label: 'set_monospace',
                    detail: 'set_monospace(monospace)',
                    docs: 'DOC?',
                    insert: 'set_monospace($1)'
                },
                {
                    label: 'set_overwrite',
                    detail: 'set_overwrite(overwrite)',
                    docs: 'DOC?',
                    insert: 'set_overwrite($1)'
                },
                {
                    label: 'set_pixels_above_lines',
                    detail: 'set_pixels_above_lines(pixels_above_lines)',
                    docs: 'DOC?',
                    insert: 'set_pixels_above_lines($1)'
                },
                {
                    label: 'set_pixels_below_lines',
                    detail: 'set_pixels_below_lines(pixels_below_lines)',
                    docs: 'DOC?',
                    insert: 'set_pixels_below_lines($1)'
                },
                {
                    label: 'set_pixels_inside_wrap',
                    detail: 'set_pixels_inside_wrap(pixels_inside_wrap)',
                    docs: 'DOC?',
                    insert: 'set_pixels_inside_wrap($1)'
                },
                {
                    label: 'set_right_margin',
                    detail: 'set_right_margin(right_margin)',
                    docs: 'DOC?',
                    insert: 'set_right_margin($1)'
                },
                {
                    label: 'set_tabs',
                    detail: 'set_tabs(tabs)',
                    docs: 'DOC?',
                    insert: 'set_tabs($1)'
                },
                {
                    label: 'set_top_margin',
                    detail: 'set_top_margin(top_margin)',
                    docs: 'DOC?',
                    insert: 'set_top_margin($1)'
                },
                {
                    label: 'set_wrap_mode',
                    detail: 'set_wrap_mode(wrap_mode)',
                    docs: 'DOC?',
                    insert: 'set_wrap_mode($1)'
                },
                {
                    label: 'starts_display_line',
                    detail: 'starts_display_line(iter)',
                    docs: 'DOC?',
                    insert: 'starts_display_line($1)'
                },
                {
                    label: 'window_to_buffer_coords',
                    detail: 'window_to_buffer_coords(win, window_x, window_y)',
                    docs: 'DOC?',
                    insert: 'window_to_buffer_coords($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkToolPalette = [
                {
                    label: 'get_drag_target_group',
                    detail: 'get_drag_target_group()',
                    docs: 'DOC?',
                    insert: 'get_drag_target_group()'
                },
                {
                    label: 'get_drag_target_item',
                    detail: 'get_drag_target_item()',
                    docs: 'DOC?',
                    insert: 'get_drag_target_item()'
                },
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'add_drag_dest',
                    detail: 'add_drag_dest(widget, flags, targets, actions)',
                    docs: 'DOC?',
                    insert: 'add_drag_dest($1)'
                },
                {
                    label: 'get_drag_item',
                    detail: 'get_drag_item(selection)',
                    docs: 'DOC?',
                    insert: 'get_drag_item($1)'
                },
                {
                    label: 'get_drop_group',
                    detail: 'get_drop_group(x, y)',
                    docs: 'DOC?',
                    insert: 'get_drop_group($1)'
                },
                {
                    label: 'get_drop_item',
                    detail: 'get_drop_item(x, y)',
                    docs: 'DOC?',
                    insert: 'get_drop_item($1)'
                },
                {
                    label: 'get_exclusive',
                    detail: 'get_exclusive(group)',
                    docs: 'DOC?',
                    insert: 'get_exclusive($1)'
                },
                {
                    label: 'get_expand',
                    detail: 'get_expand(group)',
                    docs: 'DOC?',
                    insert: 'get_expand($1)'
                },
                {
                    label: 'get_group_position',
                    detail: 'get_group_position(group)',
                    docs: 'DOC?',
                    insert: 'get_group_position($1)'
                },
                {
                    label: 'get_hadjustment',
                    detail: 'get_hadjustment()',
                    docs: 'DOC?',
                    insert: 'get_hadjustment()'
                },
                {
                    label: 'get_icon_size',
                    detail: 'get_icon_size()',
                    docs: 'DOC?',
                    insert: 'get_icon_size()'
                },
                {
                    label: 'get_style',
                    detail: 'get_style()',
                    docs: 'DOC?',
                    insert: 'get_style()'
                },
                {
                    label: 'get_vadjustment',
                    detail: 'get_vadjustment()',
                    docs: 'DOC?',
                    insert: 'get_vadjustment()'
                },
                {
                    label: 'set_drag_source',
                    detail: 'set_drag_source(targets)',
                    docs: 'DOC?',
                    insert: 'set_drag_source($1)'
                },
                {
                    label: 'set_exclusive',
                    detail: 'set_exclusive(group, exclusive)',
                    docs: 'DOC?',
                    insert: 'set_exclusive($1)'
                },
                {
                    label: 'set_expand',
                    detail: 'set_expand(group, expand)',
                    docs: 'DOC?',
                    insert: 'set_expand($1)'
                },
                {
                    label: 'set_group_position',
                    detail: 'set_group_position(group, position)',
                    docs: 'DOC?',
                    insert: 'set_group_position($1)'
                },
                {
                    label: 'set_icon_size',
                    detail: 'set_icon_size(icon_size)',
                    docs: 'DOC?',
                    insert: 'set_icon_size($1)'
                },
                {
                    label: 'set_style',
                    detail: 'set_style(style)',
                    docs: 'DOC?',
                    insert: 'set_style($1)'
                },
                {
                    label: 'unset_icon_size',
                    detail: 'unset_icon_size()',
                    docs: 'DOC?',
                    insert: 'unset_icon_size()'
                },
                {
                    label: 'unset_style',
                    detail: 'unset_style()',
                    docs: 'DOC?',
                    insert: 'unset_style()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkToolItemGroup = [
                {
                    label: 'new',
                    detail: 'new(label)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'get_collapsed',
                    detail: 'get_collapsed()',
                    docs: 'DOC?',
                    insert: 'get_collapsed()'
                },
                {
                    label: 'get_drop_item',
                    detail: 'get_drop_item(x, y)',
                    docs: 'DOC?',
                    insert: 'get_drop_item($1)'
                },
                {
                    label: 'get_ellipsize',
                    detail: 'get_ellipsize()',
                    docs: 'DOC?',
                    insert: 'get_ellipsize()'
                },
                {
                    label: 'get_header_relief',
                    detail: 'get_header_relief()',
                    docs: 'DOC?',
                    insert: 'get_header_relief()'
                },
                {
                    label: 'get_item_position',
                    detail: 'get_item_position(item)',
                    docs: 'DOC?',
                    insert: 'get_item_position($1)'
                },
                {
                    label: 'get_label',
                    detail: 'get_label()',
                    docs: 'DOC?',
                    insert: 'get_label()'
                },
                {
                    label: 'get_label_widget',
                    detail: 'get_label_widget()',
                    docs: 'DOC?',
                    insert: 'get_label_widget()'
                },
                {
                    label: 'get_n_items',
                    detail: 'get_n_items()',
                    docs: 'DOC?',
                    insert: 'get_n_items()'
                },
                {
                    label: 'get_nth_item',
                    detail: 'get_nth_item(index)',
                    docs: 'DOC?',
                    insert: 'get_nth_item($1)'
                },
                {
                    label: 'insert',
                    detail: 'insert(item, position)',
                    docs: 'DOC?',
                    insert: 'insert($1)'
                },
                {
                    label: 'set_collapsed',
                    detail: 'set_collapsed(collapsed)',
                    docs: 'DOC?',
                    insert: 'set_collapsed($1)'
                },
                {
                    label: 'set_ellipsize',
                    detail: 'set_ellipsize(ellipsize)',
                    docs: 'DOC?',
                    insert: 'set_ellipsize($1)'
                },
                {
                    label: 'set_header_relief',
                    detail: 'set_header_relief(style)',
                    docs: 'DOC?',
                    insert: 'set_header_relief($1)'
                },
                {
                    label: 'set_item_position',
                    detail: 'set_item_position(item, position)',
                    docs: 'DOC?',
                    insert: 'set_item_position($1)'
                },
                {
                    label: 'set_label',
                    detail: 'set_label(label)',
                    docs: 'DOC?',
                    insert: 'set_label($1)'
                },
                {
                    label: 'set_label_widget',
                    detail: 'set_label_widget(label_widget)',
                    docs: 'DOC?',
                    insert: 'set_label_widget($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkToolShell = [
                {
                    label: 'get_ellipsize_mode',
                    detail: 'get_ellipsize_mode()',
                    docs: 'DOC?',
                    insert: 'get_ellipsize_mode()'
                },
                {
                    label: 'get_icon_size',
                    detail: 'get_icon_size()',
                    docs: 'DOC?',
                    insert: 'get_icon_size()'
                },
                {
                    label: 'get_orientation',
                    detail: 'get_orientation()',
                    docs: 'DOC?',
                    insert: 'get_orientation()'
                },
                {
                    label: 'get_relief_style',
                    detail: 'get_relief_style()',
                    docs: 'DOC?',
                    insert: 'get_relief_style()'
                },
                {
                    label: 'get_style',
                    detail: 'get_style()',
                    docs: 'DOC?',
                    insert: 'get_style()'
                },
                {
                    label: 'get_text_alignment',
                    detail: 'get_text_alignment()',
                    docs: 'DOC?',
                    insert: 'get_text_alignment()'
                },
                {
                    label: 'get_text_orientation',
                    detail: 'get_text_orientation()',
                    docs: 'DOC?',
                    insert: 'get_text_orientation()'
                },
                {
                    label: 'get_text_size_group',
                    detail: 'get_text_size_group()',
                    docs: 'DOC?',
                    insert: 'get_text_size_group()'
                },
                {
                    label: 'rebuild_menu',
                    detail: 'rebuild_menu()',
                    docs: 'DOC?',
                    insert: 'rebuild_menu()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkToolbar = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'get_drop_index',
                    detail: 'get_drop_index(x, y)',
                    docs: 'DOC?',
                    insert: 'get_drop_index($1)'
                },
                {
                    label: 'get_icon_size',
                    detail: 'get_icon_size()',
                    docs: 'DOC?',
                    insert: 'get_icon_size()'
                },
                {
                    label: 'get_item_index',
                    detail: 'get_item_index(item)',
                    docs: 'DOC?',
                    insert: 'get_item_index($1)'
                },
                {
                    label: 'get_n_items',
                    detail: 'get_n_items()',
                    docs: 'DOC?',
                    insert: 'get_n_items()'
                },
                {
                    label: 'get_nth_item',
                    detail: 'get_nth_item(n)',
                    docs: 'DOC?',
                    insert: 'get_nth_item($1)'
                },
                {
                    label: 'get_relief_style',
                    detail: 'get_relief_style()',
                    docs: 'DOC?',
                    insert: 'get_relief_style()'
                },
                {
                    label: 'get_show_arrow',
                    detail: 'get_show_arrow()',
                    docs: 'DOC?',
                    insert: 'get_show_arrow()'
                },
                {
                    label: 'get_style',
                    detail: 'get_style()',
                    docs: 'DOC?',
                    insert: 'get_style()'
                },
                {
                    label: 'insert',
                    detail: 'insert(item, pos)',
                    docs: 'DOC?',
                    insert: 'insert($1)'
                },
                {
                    label: 'set_drop_highlight_item',
                    detail: 'set_drop_highlight_item(tool_item, index_)',
                    docs: 'DOC?',
                    insert: 'set_drop_highlight_item($1)'
                },
                {
                    label: 'set_icon_size',
                    detail: 'set_icon_size(icon_size)',
                    docs: 'DOC?',
                    insert: 'set_icon_size($1)'
                },
                {
                    label: 'set_show_arrow',
                    detail: 'set_show_arrow(show_arrow)',
                    docs: 'DOC?',
                    insert: 'set_show_arrow($1)'
                },
                {
                    label: 'set_style',
                    detail: 'set_style(style)',
                    docs: 'DOC?',
                    insert: 'set_style($1)'
                },
                {
                    label: 'unset_icon_size',
                    detail: 'unset_icon_size()',
                    docs: 'DOC?',
                    insert: 'unset_icon_size()'
                },
                {
                    label: 'unset_style',
                    detail: 'unset_style()',
                    docs: 'DOC?',
                    insert: 'unset_style()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkTreeView = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'new_with_model',
                    detail: 'new_with_model(model)',
                    docs: 'DOC?',
                    insert: 'new_with_model($1)'
                },
                {
                    label: 'append_column',
                    detail: 'append_column(column)',
                    docs: 'DOC?',
                    insert: 'append_column($1)'
                },
                {
                    label: 'collapse_all',
                    detail: 'collapse_all()',
                    docs: 'DOC?',
                    insert: 'collapse_all()'
                },
                {
                    label: 'collapse_row',
                    detail: 'collapse_row(path)',
                    docs: 'DOC?',
                    insert: 'collapse_row($1)'
                },
                {
                    label: 'columns_autosize',
                    detail: 'columns_autosize()',
                    docs: 'DOC?',
                    insert: 'columns_autosize()'
                },
                {
                    label: 'convert_bin_window_to_tree_coords',
                    detail: 'convert_bin_window_to_tree_coords(bx, by)',
                    docs: 'DOC?',
                    insert: 'convert_bin_window_to_tree_coords($1)'
                },
                {
                    label: 'convert_bin_window_to_widget_coords',
                    detail: 'convert_bin_window_to_widget_coords(bx, by)',
                    docs: 'DOC?',
                    insert: 'convert_bin_window_to_widget_coords($1)'
                },
                {
                    label: 'convert_tree_to_bin_window_coords',
                    detail: 'convert_tree_to_bin_window_coords(tx, ty)',
                    docs: 'DOC?',
                    insert: 'convert_tree_to_bin_window_coords($1)'
                },
                {
                    label: 'convert_tree_to_widget_coords',
                    detail: 'convert_tree_to_widget_coords(tx, ty)',
                    docs: 'DOC?',
                    insert: 'convert_tree_to_widget_coords($1)'
                },
                {
                    label: 'convert_widget_to_bin_window_coords',
                    detail: 'convert_widget_to_bin_window_coords(wx, wy)',
                    docs: 'DOC?',
                    insert: 'convert_widget_to_bin_window_coords($1)'
                },
                {
                    label: 'convert_widget_to_tree_coords',
                    detail: 'convert_widget_to_tree_coords(wx, wy)',
                    docs: 'DOC?',
                    insert: 'convert_widget_to_tree_coords($1)'
                },
                {
                    label: 'create_row_drag_icon',
                    detail: 'create_row_drag_icon(path)',
                    docs: 'DOC?',
                    insert: 'create_row_drag_icon($1)'
                },
                {
                    label: 'enable_model_drag_dest',
                    detail: 'enable_model_drag_dest(targets, actions)',
                    docs: 'DOC?',
                    insert: 'enable_model_drag_dest($1)'
                },
                {
                    label: 'enable_model_drag_source',
                    detail: 'enable_model_drag_source(start_button_mask, targets, actions)',
                    docs: 'DOC?',
                    insert: 'enable_model_drag_source($1)'
                },
                {
                    label: 'expand_all',
                    detail: 'expand_all()',
                    docs: 'DOC?',
                    insert: 'expand_all()'
                },
                {
                    label: 'expand_row',
                    detail: 'expand_row(path, open_all)',
                    docs: 'DOC?',
                    insert: 'expand_row($1)'
                },
                {
                    label: 'expand_to_path',
                    detail: 'expand_to_path(path)',
                    docs: 'DOC?',
                    insert: 'expand_to_path($1)'
                },
                {
                    label: 'get_activate_on_single_click',
                    detail: 'get_activate_on_single_click()',
                    docs: 'DOC?',
                    insert: 'get_activate_on_single_click()'
                },
                {
                    label: 'get_background_area',
                    detail: 'get_background_area(path, column)',
                    docs: 'DOC?',
                    insert: 'get_background_area($1)'
                },
                {
                    label: 'get_bin_window',
                    detail: 'get_bin_window()',
                    docs: 'DOC?',
                    insert: 'get_bin_window()'
                },
                {
                    label: 'get_cell_area',
                    detail: 'get_cell_area(path, column)',
                    docs: 'DOC?',
                    insert: 'get_cell_area($1)'
                },
                {
                    label: 'get_column',
                    detail: 'get_column(n)',
                    docs: 'DOC?',
                    insert: 'get_column($1)'
                },
                {
                    label: 'get_columns',
                    detail: 'get_columns()',
                    docs: 'DOC?',
                    insert: 'get_columns()'
                },
                {
                    label: 'get_cursor',
                    detail: 'get_cursor()',
                    docs: 'DOC?',
                    insert: 'get_cursor()'
                },
                {
                    label: 'get_dest_row_at_pos',
                    detail: 'get_dest_row_at_pos(drag_x, drag_y)',
                    docs: 'DOC?',
                    insert: 'get_dest_row_at_pos($1)'
                },
                {
                    label: 'get_drag_dest_row',
                    detail: 'get_drag_dest_row()',
                    docs: 'DOC?',
                    insert: 'get_drag_dest_row()'
                },
                {
                    label: 'get_enable_search',
                    detail: 'get_enable_search()',
                    docs: 'DOC?',
                    insert: 'get_enable_search()'
                },
                {
                    label: 'get_enable_tree_lines',
                    detail: 'get_enable_tree_lines()',
                    docs: 'DOC?',
                    insert: 'get_enable_tree_lines()'
                },
                {
                    label: 'get_expander_column',
                    detail: 'get_expander_column()',
                    docs: 'DOC?',
                    insert: 'get_expander_column()'
                },
                {
                    label: 'get_fixed_height_mode',
                    detail: 'get_fixed_height_mode()',
                    docs: 'DOC?',
                    insert: 'get_fixed_height_mode()'
                },
                {
                    label: 'get_grid_lines',
                    detail: 'get_grid_lines()',
                    docs: 'DOC?',
                    insert: 'get_grid_lines()'
                },
                {
                    label: 'get_hadjustment',
                    detail: 'get_hadjustment()',
                    docs: 'DOC?',
                    insert: 'get_hadjustment()'
                },
                {
                    label: 'get_headers_clickable',
                    detail: 'get_headers_clickable()',
                    docs: 'DOC?',
                    insert: 'get_headers_clickable()'
                },
                {
                    label: 'get_headers_visible',
                    detail: 'get_headers_visible()',
                    docs: 'DOC?',
                    insert: 'get_headers_visible()'
                },
                {
                    label: 'get_hover_expand',
                    detail: 'get_hover_expand()',
                    docs: 'DOC?',
                    insert: 'get_hover_expand()'
                },
                {
                    label: 'get_hover_selection',
                    detail: 'get_hover_selection()',
                    docs: 'DOC?',
                    insert: 'get_hover_selection()'
                },
                {
                    label: 'get_level_indentation',
                    detail: 'get_level_indentation()',
                    docs: 'DOC?',
                    insert: 'get_level_indentation()'
                },
                {
                    label: 'get_model',
                    detail: 'get_model()',
                    docs: 'DOC?',
                    insert: 'get_model()'
                },
                {
                    label: 'get_n_columns',
                    detail: 'get_n_columns()',
                    docs: 'DOC?',
                    insert: 'get_n_columns()'
                },
                {
                    label: 'get_path_at_pos',
                    detail: 'get_path_at_pos(x, y)',
                    docs: 'DOC?',
                    insert: 'get_path_at_pos($1)'
                },
                {
                    label: 'get_reorderable',
                    detail: 'get_reorderable()',
                    docs: 'DOC?',
                    insert: 'get_reorderable()'
                },
                {
                    label: 'get_rubber_banding',
                    detail: 'get_rubber_banding()',
                    docs: 'DOC?',
                    insert: 'get_rubber_banding()'
                },
                {
                    label: 'get_rules_hint',
                    detail: 'get_rules_hint()',
                    docs: 'DOC?',
                    insert: 'get_rules_hint()'
                },
                {
                    label: 'get_search_column',
                    detail: 'get_search_column()',
                    docs: 'DOC?',
                    insert: 'get_search_column()'
                },
                {
                    label: 'get_search_entry',
                    detail: 'get_search_entry()',
                    docs: 'DOC?',
                    insert: 'get_search_entry()'
                },
                {
                    label: 'get_selection',
                    detail: 'get_selection()',
                    docs: 'DOC?',
                    insert: 'get_selection()'
                },
                {
                    label: 'get_show_expanders',
                    detail: 'get_show_expanders()',
                    docs: 'DOC?',
                    insert: 'get_show_expanders()'
                },
                {
                    label: 'get_tooltip_column',
                    detail: 'get_tooltip_column()',
                    docs: 'DOC?',
                    insert: 'get_tooltip_column()'
                },
                {
                    label: 'get_tooltip_context',
                    detail: 'get_tooltip_context(x, y, keyboard_tip)',
                    docs: 'DOC?',
                    insert: 'get_tooltip_context($1)'
                },
                {
                    label: 'get_vadjustment',
                    detail: 'get_vadjustment()',
                    docs: 'DOC?',
                    insert: 'get_vadjustment()'
                },
                {
                    label: 'get_visible_range',
                    detail: 'get_visible_range()',
                    docs: 'DOC?',
                    insert: 'get_visible_range()'
                },
                {
                    label: 'get_visible_rect',
                    detail: 'get_visible_rect()',
                    docs: 'DOC?',
                    insert: 'get_visible_rect()'
                },
                {
                    label: 'insert_column',
                    detail: 'insert_column(column, position)',
                    docs: 'DOC?',
                    insert: 'insert_column($1)'
                },
                {
                    label: 'insert_column_with_attributes',
                    detail: 'insert_column_with_attributes(position, title, cell, **kwargs)',
                    docs: 'DOC?',
                    insert: 'insert_column_with_attributes($1)'
                },
                {
                    label: 'insert_column_with_data_func',
                    detail: 'insert_column_with_data_func(position, title, cell, func, *data)',
                    docs: 'DOC?',
                    insert: 'insert_column_with_data_func($1)'
                },
                {
                    label: 'is_blank_at_pos',
                    detail: 'is_blank_at_pos(x, y)',
                    docs: 'DOC?',
                    insert: 'is_blank_at_pos($1)'
                },
                {
                    label: 'is_rubber_banding_active',
                    detail: 'is_rubber_banding_active()',
                    docs: 'DOC?',
                    insert: 'is_rubber_banding_active()'
                },
                {
                    label: 'map_expanded_rows',
                    detail: 'map_expanded_rows(func, *data)',
                    docs: 'DOC?',
                    insert: 'map_expanded_rows($1)'
                },
                {
                    label: 'move_column_after',
                    detail: 'move_column_after(column, base_column)',
                    docs: 'DOC?',
                    insert: 'move_column_after($1)'
                },
                {
                    label: 'remove_column',
                    detail: 'remove_column(column)',
                    docs: 'DOC?',
                    insert: 'remove_column($1)'
                },
                {
                    label: 'row_activated',
                    detail: 'row_activated(path, column)',
                    docs: 'DOC?',
                    insert: 'row_activated($1)'
                },
                {
                    label: 'row_expanded',
                    detail: 'row_expanded(path)',
                    docs: 'DOC?',
                    insert: 'row_expanded($1)'
                },
                {
                    label: 'scroll_to_cell',
                    detail: 'scroll_to_cell(path, column, use_align, row_align, col_align)',
                    docs: 'DOC?',
                    insert: 'scroll_to_cell($1)'
                },
                {
                    label: 'scroll_to_point',
                    detail: 'scroll_to_point(tree_x, tree_y)',
                    docs: 'DOC?',
                    insert: 'scroll_to_point($1)'
                },
                {
                    label: 'set_activate_on_single_click',
                    detail: 'set_activate_on_single_click(single)',
                    docs: 'DOC?',
                    insert: 'set_activate_on_single_click($1)'
                },
                {
                    label: 'set_column_drag_function',
                    detail: 'set_column_drag_function(func, *user_data)',
                    docs: 'DOC?',
                    insert: 'set_column_drag_function($1)'
                },
                {
                    label: 'set_cursor',
                    detail: 'set_cursor(path, focus_column, start_editing)',
                    docs: 'DOC?',
                    insert: 'set_cursor($1)'
                },
                {
                    label: 'set_cursor_on_cell',
                    detail: 'set_cursor_on_cell(path, focus_column, focus_cell, start_editing)',
                    docs: 'DOC?',
                    insert: 'set_cursor_on_cell($1)'
                },
                {
                    label: 'set_destroy_count_func',
                    detail: 'set_destroy_count_func(func, *data)',
                    docs: 'DOC?',
                    insert: 'set_destroy_count_func($1)'
                },
                {
                    label: 'set_drag_dest_row',
                    detail: 'set_drag_dest_row(path, pos)',
                    docs: 'DOC?',
                    insert: 'set_drag_dest_row($1)'
                },
                {
                    label: 'set_enable_search',
                    detail: 'set_enable_search(enable_search)',
                    docs: 'DOC?',
                    insert: 'set_enable_search($1)'
                },
                {
                    label: 'set_enable_tree_lines',
                    detail: 'set_enable_tree_lines(enabled)',
                    docs: 'DOC?',
                    insert: 'set_enable_tree_lines($1)'
                },
                {
                    label: 'set_expander_column',
                    detail: 'set_expander_column(column)',
                    docs: 'DOC?',
                    insert: 'set_expander_column($1)'
                },
                {
                    label: 'set_fixed_height_mode',
                    detail: 'set_fixed_height_mode(enable)',
                    docs: 'DOC?',
                    insert: 'set_fixed_height_mode($1)'
                },
                {
                    label: 'set_grid_lines',
                    detail: 'set_grid_lines(grid_lines)',
                    docs: 'DOC?',
                    insert: 'set_grid_lines($1)'
                },
                {
                    label: 'set_hadjustment',
                    detail: 'set_hadjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_hadjustment($1)'
                },
                {
                    label: 'set_headers_clickable',
                    detail: 'set_headers_clickable(setting)',
                    docs: 'DOC?',
                    insert: 'set_headers_clickable($1)'
                },
                {
                    label: 'set_headers_visible',
                    detail: 'set_headers_visible(headers_visible)',
                    docs: 'DOC?',
                    insert: 'set_headers_visible($1)'
                },
                {
                    label: 'set_hover_expand',
                    detail: 'set_hover_expand(expand)',
                    docs: 'DOC?',
                    insert: 'set_hover_expand($1)'
                },
                {
                    label: 'set_hover_selection',
                    detail: 'set_hover_selection(hover)',
                    docs: 'DOC?',
                    insert: 'set_hover_selection($1)'
                },
                {
                    label: 'set_level_indentation',
                    detail: 'set_level_indentation(indentation)',
                    docs: 'DOC?',
                    insert: 'set_level_indentation($1)'
                },
                {
                    label: 'set_model',
                    detail: 'set_model(model)',
                    docs: 'DOC?',
                    insert: 'set_model($1)'
                },
                {
                    label: 'set_reorderable',
                    detail: 'set_reorderable(reorderable)',
                    docs: 'DOC?',
                    insert: 'set_reorderable($1)'
                },
                {
                    label: 'set_row_separator_func',
                    detail: 'set_row_separator_func(func, *data)',
                    docs: 'DOC?',
                    insert: 'set_row_separator_func($1)'
                },
                {
                    label: 'set_rubber_banding',
                    detail: 'set_rubber_banding(enable)',
                    docs: 'DOC?',
                    insert: 'set_rubber_banding($1)'
                },
                {
                    label: 'set_rules_hint',
                    detail: 'set_rules_hint(setting)',
                    docs: 'DOC?',
                    insert: 'set_rules_hint($1)'
                },
                {
                    label: 'set_search_column',
                    detail: 'set_search_column(column)',
                    docs: 'DOC?',
                    insert: 'set_search_column($1)'
                },
                {
                    label: 'set_search_entry',
                    detail: 'set_search_entry(entry)',
                    docs: 'DOC?',
                    insert: 'set_search_entry($1)'
                },
                {
                    label: 'set_search_equal_func',
                    detail: 'set_search_equal_func(search_equal_func, *search_user_data)',
                    docs: 'DOC?',
                    insert: 'set_search_equal_func($1)'
                },
                {
                    label: 'set_search_position_func',
                    detail: 'set_search_position_func(func, *data)',
                    docs: 'DOC?',
                    insert: 'set_search_position_func($1)'
                },
                {
                    label: 'set_show_expanders',
                    detail: 'set_show_expanders(enabled)',
                    docs: 'DOC?',
                    insert: 'set_show_expanders($1)'
                },
                {
                    label: 'set_tooltip_cell',
                    detail: 'set_tooltip_cell(tooltip, path, column, cell)',
                    docs: 'DOC?',
                    insert: 'set_tooltip_cell($1)'
                },
                {
                    label: 'set_tooltip_column',
                    detail: 'set_tooltip_column(column)',
                    docs: 'DOC?',
                    insert: 'set_tooltip_column($1)'
                },
                {
                    label: 'set_tooltip_row',
                    detail: 'set_tooltip_row(tooltip, path)',
                    docs: 'DOC?',
                    insert: 'set_tooltip_row($1)'
                },
                {
                    label: 'set_vadjustment',
                    detail: 'set_vadjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_vadjustment($1)'
                },
                {
                    label: 'unset_rows_drag_dest',
                    detail: 'unset_rows_drag_dest()',
                    docs: 'DOC?',
                    insert: 'unset_rows_drag_dest()'
                },
                {
                    label: 'unset_rows_drag_source',
                    detail: 'unset_rows_drag_source()',
                    docs: 'DOC?',
                    insert: 'unset_rows_drag_source()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkScaleButton = [
                {
                    label: 'new',
                    detail: 'new(size, min, max, step, icons)',
                    docs: 'DOC?',
                    insert: 'new($1)'
                },
                {
                    label: 'get_adjustment',
                    detail: 'get_adjustment()',
                    docs: 'DOC?',
                    insert: 'get_adjustment()'
                },
                {
                    label: 'get_minus_button',
                    detail: 'get_minus_button()',
                    docs: 'DOC?',
                    insert: 'get_minus_button()'
                },
                {
                    label: 'get_plus_button',
                    detail: 'get_plus_button()',
                    docs: 'DOC?',
                    insert: 'get_plus_button()'
                },
                {
                    label: 'get_popup',
                    detail: 'get_popup()',
                    docs: 'DOC?',
                    insert: 'get_popup()'
                },
                {
                    label: 'get_value',
                    detail: 'get_value()',
                    docs: 'DOC?',
                    insert: 'get_value()'
                },
                {
                    label: 'set_adjustment',
                    detail: 'set_adjustment(adjustment)',
                    docs: 'DOC?',
                    insert: 'set_adjustment($1)'
                },
                {
                    label: 'set_icons',
                    detail: 'set_icons(icons)',
                    docs: 'DOC?',
                    insert: 'set_icons($1)'
                },
                {
                    label: 'set_value',
                    detail: 'set_value(value)',
                    docs: 'DOC?',
                    insert: 'set_value($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkCssProvider = [
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'load_from_bytes',
                    detail: 'load_from_bytes(data)',
                    docs: 'DOC?',
                    insert: 'load_from_bytes($1)'
                },
                {
                    label: 'load_from_data',
                    detail: 'load_from_data(data, length)',
                    docs: 'DOC?',
                    insert: 'load_from_data($1)'
                },
                {
                    label: 'load_from_file',
                    detail: 'load_from_file(file)',
                    docs: 'DOC?',
                    insert: 'load_from_file($1)'
                },
                {
                    label: 'load_from_path',
                    detail: 'load_from_path(path)',
                    docs: 'DOC?',
                    insert: 'load_from_path($1)'
                },
                {
                    label: 'load_from_resource',
                    detail: 'load_from_resource(resource_path)',
                    docs: 'DOC?',
                    insert: 'load_from_resource($1)'
                },
                {
                    label: 'load_from_string',
                    detail: 'load_from_string(string)',
                    docs: 'DOC?',
                    insert: 'load_from_string($1)'
                },
                {
                    label: 'load_named',
                    detail: 'load_named(name, variant)',
                    docs: 'DOC?',
                    insert: 'load_named($1)'
                },
                {
                    label: 'to_string',
                    detail: 'to_string()',
                    docs: 'DOC?',
                    insert: 'to_string()'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GdkScreen = [
                {
                    label: 'get_default',
                    detail: 'get_default()',
                    docs: 'DOC?',
                    insert: 'get_default()'
                },
                {
                    label: 'height',
                    detail: 'height()',
                    docs: 'DOC?',
                    insert: 'height()'
                },
                {
                    label: 'height_mm',
                    detail: 'height_mm()',
                    docs: 'DOC?',
                    insert: 'height_mm()'
                },
                {
                    label: 'width',
                    detail: 'width()',
                    docs: 'DOC?',
                    insert: 'width()'
                },
                {
                    label: 'width_mm',
                    detail: 'width_mm()',
                    docs: 'DOC?',
                    insert: 'width_mm()'
                },
                {
                    label: 'get_active_window',
                    detail: 'get_active_window()',
                    docs: 'DOC?',
                    insert: 'get_active_window()'
                },
                {
                    label: 'get_display',
                    detail: 'get_display()',
                    docs: 'DOC?',
                    insert: 'get_display()'
                },
                {
                    label: 'get_font_options',
                    detail: 'get_font_options()',
                    docs: 'DOC?',
                    insert: 'get_font_options()'
                },
                {
                    label: 'get_height',
                    detail: 'get_height()',
                    docs: 'DOC?',
                    insert: 'get_height()'
                },
                {
                    label: 'get_height_mm',
                    detail: 'get_height_mm()',
                    docs: 'DOC?',
                    insert: 'get_height_mm()'
                },
                {
                    label: 'get_monitor_at_point',
                    detail: 'get_monitor_at_point(x, y)',
                    docs: 'DOC?',
                    insert: 'get_monitor_at_point($1)'
                },
                {
                    label: 'get_monitor_at_window',
                    detail: 'get_monitor_at_window(window)',
                    docs: 'DOC?',
                    insert: 'get_monitor_at_window($1)'
                },
                {
                    label: 'get_monitor_geometry',
                    detail: 'get_monitor_geometry(monitor_num)',
                    docs: 'DOC?',
                    insert: 'get_monitor_geometry($1)'
                },
                {
                    label: 'get_monitor_height_mm',
                    detail: 'get_monitor_height_mm(monitor_num)',
                    docs: 'DOC?',
                    insert: 'get_monitor_height_mm($1)'
                },
                {
                    label: 'get_monitor_plug_name',
                    detail: 'get_monitor_plug_name(monitor_num)',
                    docs: 'DOC?',
                    insert: 'get_monitor_plug_name($1)'
                },
                {
                    label: 'get_monitor_scale_factor',
                    detail: 'get_monitor_scale_factor(monitor_num)',
                    docs: 'DOC?',
                    insert: 'get_monitor_scale_factor($1)'
                },
                {
                    label: 'get_monitor_width_mm',
                    detail: 'get_monitor_width_mm(monitor_num)',
                    docs: 'DOC?',
                    insert: 'get_monitor_width_mm($1)'
                },
                {
                    label: 'get_monitor_workarea',
                    detail: 'get_monitor_workarea(monitor_num)',
                    docs: 'DOC?',
                    insert: 'get_monitor_workarea($1)'
                },
                {
                    label: 'get_n_monitors',
                    detail: 'get_n_monitors()',
                    docs: 'DOC?',
                    insert: 'get_n_monitors()'
                },
                {
                    label: 'get_number',
                    detail: 'get_number()',
                    docs: 'DOC?',
                    insert: 'get_number()'
                },
                {
                    label: 'get_primary_monitor',
                    detail: 'get_primary_monitor()',
                    docs: 'DOC?',
                    insert: 'get_primary_monitor()'
                },
                {
                    label: 'get_resolution',
                    detail: 'get_resolution()',
                    docs: 'DOC?',
                    insert: 'get_resolution()'
                },
                {
                    label: 'get_rgba_visual',
                    detail: 'get_rgba_visual()',
                    docs: 'DOC?',
                    insert: 'get_rgba_visual()'
                },
                {
                    label: 'get_root_window',
                    detail: 'get_root_window()',
                    docs: 'DOC?',
                    insert: 'get_root_window()'
                },
                {
                    label: 'get_setting',
                    detail: 'get_setting(name, value)',
                    docs: 'DOC?',
                    insert: 'get_setting($1)'
                },
                {
                    label: 'get_system_visual',
                    detail: 'get_system_visual()',
                    docs: 'DOC?',
                    insert: 'get_system_visual()'
                },
                {
                    label: 'get_toplevel_windows',
                    detail: 'get_toplevel_windows()',
                    docs: 'DOC?',
                    insert: 'get_toplevel_windows()'
                },
                {
                    label: 'get_width',
                    detail: 'get_width()',
                    docs: 'DOC?',
                    insert: 'get_width()'
                },
                {
                    label: 'get_width_mm',
                    detail: 'get_width_mm()',
                    docs: 'DOC?',
                    insert: 'get_width_mm()'
                },
                {
                    label: 'get_window_stack',
                    detail: 'get_window_stack()',
                    docs: 'DOC?',
                    insert: 'get_window_stack()'
                },
                {
                    label: 'is_composited',
                    detail: 'is_composited()',
                    docs: 'DOC?',
                    insert: 'is_composited()'
                },
                {
                    label: 'list_visuals',
                    detail: 'list_visuals()',
                    docs: 'DOC?',
                    insert: 'list_visuals()'
                },
                {
                    label: 'make_display_name',
                    detail: 'make_display_name()',
                    docs: 'DOC?',
                    insert: 'make_display_name()'
                },
                {
                    label: 'set_font_options',
                    detail: 'set_font_options(options)',
                    docs: 'DOC?',
                    insert: 'set_font_options($1)'
                },
                {
                    label: 'set_resolution',
                    detail: 'set_resolution(dpi)',
                    docs: 'DOC?',
                    insert: 'set_resolution($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkStyleProvider = [
                {
                    label: 'get_icon_factory',
                    detail: 'get_icon_factory(path)',
                    docs: 'DOC?',
                    insert: 'get_icon_factory($1)'
                },
                {
                    label: 'get_style',
                    detail: 'get_style(path)',
                    docs: 'DOC?',
                    insert: 'get_style($1)'
                },
                {
                    label: 'get_style_property',
                    detail: 'get_style_property(path, state, pspec)',
                    docs: 'DOC?',
                    insert: 'get_style_property($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            const GtkStyleContext = [
                {
                    label: 'add_provider_for_screen',
                    detail: 'add_provider_for_screen(screen, provider, priority)',
                    docs: 'DOC?',
                    insert: 'add_provider_for_screen($1)'
                },
                {
                    label: 'new',
                    detail: 'new()',
                    docs: 'DOC?',
                    insert: 'new()'
                },
                {
                    label: 'remove_provider_for_screen',
                    detail: 'remove_provider_for_screen(screen, provider)',
                    docs: 'DOC?',
                    insert: 'remove_provider_for_screen($1)'
                },
                {
                    label: 'reset_widgets',
                    detail: 'reset_widgets(screen)',
                    docs: 'DOC?',
                    insert: 'reset_widgets($1)'
                },
                {
                    label: 'add_class',
                    detail: 'add_class(class_name)',
                    docs: 'DOC?',
                    insert: 'add_class($1)'
                },
                {
                    label: 'add_provider',
                    detail: 'add_provider(provider, priority)',
                    docs: 'DOC?',
                    insert: 'add_provider($1)'
                },
                {
                    label: 'add_region',
                    detail: 'add_region(region_name, flags)',
                    docs: 'DOC?',
                    insert: 'add_region($1)'
                },
                {
                    label: 'cancel_animations',
                    detail: 'cancel_animations(region_id)',
                    docs: 'DOC?',
                    insert: 'cancel_animations($1)'
                },
                {
                    label: 'get_background_color',
                    detail: 'get_background_color(state)',
                    docs: 'DOC?',
                    insert: 'get_background_color($1)'
                },
                {
                    label: 'get_border',
                    detail: 'get_border(state)',
                    docs: 'DOC?',
                    insert: 'get_border($1)'
                },
                {
                    label: 'get_border_color',
                    detail: 'get_border_color(state)',
                    docs: 'DOC?',
                    insert: 'get_border_color($1)'
                },
                {
                    label: 'get_color',
                    detail: 'get_color(state)',
                    docs: 'DOC?',
                    insert: 'get_color($1)'
                },
                {
                    label: 'get_direction',
                    detail: 'get_direction()',
                    docs: 'DOC?',
                    insert: 'get_direction()'
                },
                {
                    label: 'get_font',
                    detail: 'get_font(state)',
                    docs: 'DOC?',
                    insert: 'get_font($1)'
                },
                {
                    label: 'get_frame_clock',
                    detail: 'get_frame_clock()',
                    docs: 'DOC?',
                    insert: 'get_frame_clock()'
                },
                {
                    label: 'get_junction_sides',
                    detail: 'get_junction_sides()',
                    docs: 'DOC?',
                    insert: 'get_junction_sides()'
                },
                {
                    label: 'get_margin',
                    detail: 'get_margin(state)',
                    docs: 'DOC?',
                    insert: 'get_margin($1)'
                },
                {
                    label: 'get_padding',
                    detail: 'get_padding(state)',
                    docs: 'DOC?',
                    insert: 'get_padding($1)'
                },
                {
                    label: 'get_parent',
                    detail: 'get_parent()',
                    docs: 'DOC?',
                    insert: 'get_parent()'
                },
                {
                    label: 'get_path',
                    detail: 'get_path()',
                    docs: 'DOC?',
                    insert: 'get_path()'
                },
                {
                    label: 'get_property',
                    detail: 'get_property(property, state)',
                    docs: 'DOC?',
                    insert: 'get_property($1)'
                },
                {
                    label: 'get_scale',
                    detail: 'get_scale()',
                    docs: 'DOC?',
                    insert: 'get_scale()'
                },
                {
                    label: 'get_screen',
                    detail: 'get_screen()',
                    docs: 'DOC?',
                    insert: 'get_screen()'
                },
                {
                    label: 'get_section',
                    detail: 'get_section(property)',
                    docs: 'DOC?',
                    insert: 'get_section($1)'
                },
                {
                    label: 'get_state',
                    detail: 'get_state()',
                    docs: 'DOC?',
                    insert: 'get_state()'
                },
                {
                    label: 'get_style_property',
                    detail: 'get_style_property(property_name, value)',
                    docs: 'DOC?',
                    insert: 'get_style_property($1)'
                },
                {
                    label: 'has_class',
                    detail: 'has_class(class_name)',
                    docs: 'DOC?',
                    insert: 'has_class($1)'
                },
                {
                    label: 'has_region',
                    detail: 'has_region(region_name)',
                    docs: 'DOC?',
                    insert: 'has_region($1)'
                },
                {
                    label: 'invalidate',
                    detail: 'invalidate()',
                    docs: 'DOC?',
                    insert: 'invalidate()'
                },
                {
                    label: 'list_classes',
                    detail: 'list_classes()',
                    docs: 'DOC?',
                    insert: 'list_classes()'
                },
                {
                    label: 'list_regions',
                    detail: 'list_regions()',
                    docs: 'DOC?',
                    insert: 'list_regions()'
                },
                {
                    label: 'lookup_color',
                    detail: 'lookup_color(color_name)',
                    docs: 'DOC?',
                    insert: 'lookup_color($1)'
                },
                {
                    label: 'lookup_icon_set',
                    detail: 'lookup_icon_set(stock_id)',
                    docs: 'DOC?',
                    insert: 'lookup_icon_set($1)'
                },
                {
                    label: 'notify_state_change',
                    detail: 'notify_state_change(window, region_id, state, state_value)',
                    docs: 'DOC?',
                    insert: 'notify_state_change($1)'
                },
                {
                    label: 'pop_animatable_region',
                    detail: 'pop_animatable_region()',
                    docs: 'DOC?',
                    insert: 'pop_animatable_region()'
                },
                {
                    label: 'push_animatable_region',
                    detail: 'push_animatable_region(region_id)',
                    docs: 'DOC?',
                    insert: 'push_animatable_region($1)'
                },
                {
                    label: 'remove_class',
                    detail: 'remove_class(class_name)',
                    docs: 'DOC?',
                    insert: 'remove_class($1)'
                },
                {
                    label: 'remove_provider',
                    detail: 'remove_provider(provider)',
                    docs: 'DOC?',
                    insert: 'remove_provider($1)'
                },
                {
                    label: 'remove_region',
                    detail: 'remove_region(region_name)',
                    docs: 'DOC?',
                    insert: 'remove_region($1)'
                },
                {
                    label: 'restore',
                    detail: 'restore()',
                    docs: 'DOC?',
                    insert: 'restore()'
                },
                {
                    label: 'save',
                    detail: 'save()',
                    docs: 'DOC?',
                    insert: 'save()'
                },
                {
                    label: 'scroll_animations',
                    detail: 'scroll_animations(window, dx, dy)',
                    docs: 'DOC?',
                    insert: 'scroll_animations($1)'
                },
                {
                    label: 'set_background',
                    detail: 'set_background(window)',
                    docs: 'DOC?',
                    insert: 'set_background($1)'
                },
                {
                    label: 'set_direction',
                    detail: 'set_direction(direction)',
                    docs: 'DOC?',
                    insert: 'set_direction($1)'
                },
                {
                    label: 'set_frame_clock',
                    detail: 'set_frame_clock(frame_clock)',
                    docs: 'DOC?',
                    insert: 'set_frame_clock($1)'
                },
                {
                    label: 'set_junction_sides',
                    detail: 'set_junction_sides(sides)',
                    docs: 'DOC?',
                    insert: 'set_junction_sides($1)'
                },
                {
                    label: 'set_parent',
                    detail: 'set_parent(parent)',
                    docs: 'DOC?',
                    insert: 'set_parent($1)'
                },
                {
                    label: 'set_path',
                    detail: 'set_path(path)',
                    docs: 'DOC?',
                    insert: 'set_path($1)'
                },
                {
                    label: 'set_scale',
                    detail: 'set_scale(scale)',
                    docs: 'DOC?',
                    insert: 'set_scale($1)'
                },
                {
                    label: 'set_screen',
                    detail: 'set_screen(screen)',
                    docs: 'DOC?',
                    insert: 'set_screen($1)'
                },
                {
                    label: 'set_state',
                    detail: 'set_state(flags)',
                    docs: 'DOC?',
                    insert: 'set_state($1)'
                },
                {
                    label: 'state_is_running',
                    detail: 'state_is_running(state)',
                    docs: 'DOC?',
                    insert: 'state_is_running($1)'
                },
                {
                    label: 'to_string',
                    detail: 'to_string(flags)',
                    docs: 'DOC?',
                    insert: 'to_string($1)'
                }
            ].map(s => createItem(s, vscode.CompletionItemKind.Method));

            // ----- End Inheartence Tree -----------*-----------

            // All Main Methods
            if (linePrefix.match(/Gtk\.\w*$/i)) {
				// --- Autocomplate Section ---
                return [
					{
						label: 'Box',
						detail: 'Gtk.Box()',
						docs: 'A box in which you can arrange things in a grid pattern.',
						insert: 'Box($1)'
					},
                    {
                        label: 'Button',
                        detail: 'Gtk.Button(label="")',
                        docs: 'Interactive button - can be pressed.',
                        insert: 'Button(label="$1")'
                    },
                    {
                        label: 'Window',
                        detail: 'Gtk.Window',
                        docs: 'This is the main window that contains all the elements.',
                        insert: 'Window'
                    },
                    {
                        label: 'main',
                        detail: 'Gtk.main()',
                        docs: 'DOC?',
                        insert: 'main()'                        
                    },
                    {
                        label: 'main_quit',
                        detail: 'Gtk.main_quit',
                        docs: 'DOC?',
                        insert: 'main_quit'
                    },
                    {
                        label: 'Orientation',
                        detail: 'Gtk.Orientation',
                        docs: 'DOC?',
                        insert: 'Orientation'
                    },
                    {
                        label: 'Label',
                        detail: 'Gtk.Label()',
                        docs: 'DOC?',
                        insert: 'Label($1)'
                    },
                    {
                        label: 'Align',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'Align'
                    },
                    {
                        label: 'Entry',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'Entry()'
                    },
                    {
                        label: 'AboutDialog',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'AboutDialog()'
                    },
                    {
                        label: 'WindowPosition',
                        detail: 'Gtk.WindowPosition.[Align]',
                        docs: 'DOC?',
                        insert: 'WindowPosition'
                    },
                    {
                        label: 'AccelLabel',
                        detail: 'AccelLabel(*args, **kwargs)',
                        docs: 'DOC?',
                        insert: 'AccelLabel($1)'
                    },
                    {
                        label: 'ActionBar',
                        detail: 'ActionBar(**kwargs)',
                        docs: 'DOC?',
                        insert: 'ActionBar()'
                    },
                    {
                        label: 'AccelGroup',
                        detail: 'AccelGroup()',
                        docs: 'DOC?',
                        insert: 'AccelGroup()'
                    },
                    {
                        label: 'AppChooserButton',
                        detail: 'AppChooserButton()',
                        docs: 'DOC?',
                        insert: 'AppChooserButton($1)'
                    },
                    {
                        label: 'ComboBox',
                        detail: 'ComboBox()',
                        docs: 'DOC?',
                        insert: 'ComboBox()'
                    },
                    {
                        label: 'AppChooserDialog',
                        detail: 'AppChooserDialog()',
                        docs: 'DOC?',
                        insert: 'AppChooserDialog()'
                    },
                    {
                        label: 'Assistant',
                        detail: 'Assistant()',
                        docs: 'DOC?',
                        insert: 'Assistant()'
                    },
                    {
                        label: 'CheckButton',
                        detail: 'CheckButton()',
                        docs: 'DOC?',
                        insert: 'CheckButton($1)'
                    },
                    {
                        label: 'AssistantPageType',
                        detail: 'AssistantPageType',
                        docs: 'DOC?',
                        insert: 'AssistantPageType'
                    },
                    {
                        label: 'ColorChooserWidget',
                        detail: 'ColorChooserWidget()',
                        docs: 'DOC?',
                        insert: 'ColorChooserWidget()'
                    },
                    {
                        label: 'ColorButton',
                        detail: 'ColorButton()',
                        docs: 'DOC?',
                        insert: 'ColorButton()'
                    },
                    {
                        label: 'ColorChooserDialog',
                        detail: 'ColorChooserDialog()',
                        docs: 'DOC?',
                        insert: 'ColorChooserDialog($1)'
                    },
                    {
                        label: 'ResponseType',
                        detail: 'ResponseType',
                        docs: 'DOC?',
                        insert: 'ResponseType'
                    },
                    {
                        label: 'ListStore',
                        detail: 'ListStore()',
                        docs: 'DOC?',
                        insert: 'ListStore($1)'
                    },
                    {
                        label: 'CellRendererText',
                        detail: 'CellRendererText()',
                        docs: 'DOC?',
                        insert: 'CellRendererText()'
                    },
                    {
                        label: 'FileChooserButton',
                        detail: 'FileChooserButton()',
                        docs: 'DOC?',
                        insert: 'FileChooserButton'
                    },
                    {
                        label: 'FileChooserDialog',
                        detail: 'FileChooserDialog()',
                        docs: 'DOC?',
                        insert: 'FileChooserDialog($1)'
                    },
                    {
                        label: 'FileChooserAction',
                        detail: 'FileChooserAction()',
                        docs: 'DOC?',
                        insert: 'FileChooserAction'
                    },
                    {
                        label: 'ResponseType',
                        detail: 'ResponseType()',
                        docs: 'DOC?',
                        insert: 'ResponseType'
                    },
                    {
                        label: 'FlowBox',
                        detail: 'FlowBox()',
                        docs: 'DOC?',
                        insert: 'FlowBox()'
                    },
                    {
                        label: 'FontButton',
                        detail: 'FontButton()',
                        docs: 'DOC?',
                        insert: 'FontButton()'
                    },
                    {
                        label: 'Dialog',
                        detail: 'Dialog()',
                        docs: 'DOC?',
                        insert: 'Dialog()'
                    },
                    {
                        label: 'FontChooserDialog',
                        detail: 'FontChooserDialog()',
                        docs: 'DOC?',
                        insert: 'FontChooserDialog()'
                    },
                    {
                        label: 'Frame',
                        detail: 'Frame()',
                        docs: 'DOC?',
                        insert: 'Frame()'
                    },
                    {
                        label: 'GLArea',
                        detail: 'GLArea()',
                        docs: 'DOC?',
                        insert: 'GLArea()'
                    },
                    {
                        label: 'Grid',
                        detail: 'Grid()',
                        docs: 'DOC?',
                        insert: 'Grid()'
                    },
                    {
                        label: 'HeaderBar',
                        detail: 'HeaderBar()',
                        docs: 'DOC?',
                        insert: 'HeaderBar()'
                    },
                    {
                        label: 'IconView',
                        detail: 'IconView()',
                        docs: 'DOC?',
                        insert: 'IconView()'
                    },
                    {
                        label: 'Image',
                        detail: 'Image()',
                        docs: 'DOC?',
                        insert: 'Image()'
                    },
                    {
                        label: 'InfoBar',
                        detail: 'InfoBar()',
                        docs: 'DOC?',
                        insert: 'InfoBar()'
                    },
                    {
                        label: 'LevelBar',
                        detail: 'LevelBar()',
                        docs: 'DOC?',
                        insert: 'LevelBar()'
                    },
                    {
                        label: 'LinkButton',
                        detail: 'LinkButton()',
                        docs: 'DOC?',
                        insert: 'LinkButton()'
                    },
                    {
                        label: 'ListBox',
                        detail: 'ListBox()',
                        docs: 'DOC?',
                        insert: 'ListBox()'
                    },
                    {
                        label: 'LockButton',
                        detail: 'LockButton()',
                        docs: 'DOC?',
                        insert: 'LockButton()'
                    },
                    {
                        label: 'MenuBar',
                        detail: 'MenuBar()',
                        docs: 'DOC?',
                        insert: 'MenuBar()'
                    },
                    {
                        label: 'MenuButton',
                        detail: 'MenuButton()',
                        docs: 'DOC?',
                        insert: 'MenuButton()'
                    },
                    {
                        label: 'MessageDialog',
                        detail: 'MessageDialog()',
                        docs: 'DOC?',
                        insert: 'MessageDialog()'
                    },
                    {
                        label: 'Notebook',
                        detail: 'Notebook()',
                        docs: 'DOC?',
                        insert: 'Notebook()'
                    },
                    {
                        label: 'Paned',
                        detail: 'Paned()',
                        docs: 'DOC?',
                        insert: 'Paned()'
                    },
                    {
                        label: 'PlacesSidebar',
                        detail: 'PlacesSidebar()',
                        docs: 'DOC?',
                        insert: 'PlacesSidebar()'
                    },
                    {
                        label: 'ProgressBar',
                        detail: 'ProgressBar()',
                        docs: 'DOC?',
                        insert: 'ProgressBar()'
                    },
                    {
                        label: 'RadioButton',
                        detail: 'RadioButton()',
                        docs: 'DOC?',
                        insert: 'RadioButton()'
                    },
                    {
                        label: 'RecentChooserDialog',
                        detail: 'RecentChooserDialog()',
                        docs: 'DOC?',
                        insert: 'RecentChooserDialog()'
                    },
                    {
                        label: 'Scale',
                        detail: 'Scale()',
                        docs: 'DOC?',
                        insert: 'Scale()'
                    },
                    {
                        label: 'Scrollbar',
                        detail: 'Scrollbar()',
                        docs: 'DOC?',
                        insert: 'Scrollbar()'
                    },
                    {
                        label: 'ScrolledWindow',
                        detail: 'ScrolledWindow()',
                        docs: 'DOC?',
                        insert: 'ScrolledWindow()'
                    },
                    {
                        label: 'SearchBar',
                        detail: 'SearchBar()',
                        docs: 'DOC?',
                        insert: 'SearchBar()'
                    },
                    {
                        label: 'SearchEntry',
                        detail: 'SearchEntry()',
                        docs: 'DOC?',
                        insert: 'SearchEntry()'
                    },
                    {
                        label: 'Separator',
                        detail: 'Separator()',
                        docs: 'DOC?',
                        insert: 'Separator()'
                    },
                    {
                        label: 'SpinButton',
                        detail: 'SpinButton()',
                        docs: 'DOC?',
                        insert: 'SpinButton()'
                    },
                    {
                        label: 'Spinner',
                        detail: 'Spinner()',
                        docs: 'DOC?',
                        insert: 'Spinner()'
                    },
                    {
                        label: 'Stack',
                        detail: 'Stack()',
                        docs: 'DOC?',
                        insert: 'Stack()'
                    },
                    {
                        label: 'StackSwitcher',
                        detail: 'StackSwitcher()',
                        docs: 'DOC?',
                        insert: 'StackSwitcher()'
                    },
                    {
                        label: 'Statusbar',
                        detail: 'Statusbar()',
                        docs: 'DOC?',
                        insert: 'Statusbar()'
                    },
                    {
                        label: 'Switch',
                        detail: 'Switch()',
                        docs: 'DOC?',
                        insert: 'Switch()'
                    },
                    {
                        label: 'TextView',
                        detail: 'TextView()',
                        docs: 'DOC?',
                        insert: 'TextView()'
                    },
                    {
                        label: 'ToggleButton',
                        detail: 'ToggleButton()',
                        docs: 'DOC?',
                        insert: 'ToggleButton()'
                    },
                    {
                        label: 'ToolPalette',
                        detail: 'ToolPalette()',
                        docs: 'DOC?',
                        insert: 'ToolPalette()'
                    },
                    {
                        label: 'Toolbar',
                        detail: 'Toolbar()',
                        docs: 'DOC?',
                        insert: 'Toolbar()'
                    },
                    {
                        label: 'TreeView',
                        detail: 'TreeView()',
                        docs: 'DOC?',
                        insert: 'TreeView()'
                    },
                    {
                        label: 'VolumeButton',
                        detail: 'VolumeButton()',
                        docs: 'DOC?',
                        insert: 'VolumeButton()'
                    },
                    {
                        label: 'ToolItemGroup',
                        detail: 'ToolItemGroup()',
                        docs: 'DOC?',
                        insert: 'ToolItemGroup()'
                    },
                    {
                        label: 'CssProvider',
                        detail: 'CssProvider()',
                        docs: 'DOC?',
                        insert: 'CssProvider()'
                    },
                    {
                        label: 'STYLE_PROVIDER_PRIORITY_APPLICATION',
                        detail: 'STYLE_PROVIDER_PRIORITY_APPLICATION',
                        docs: 'DOC?',
                        insert: 'STYLE_PROVIDER_PRIORITY_APPLICATION'
                    },
                    {
                        label: 'StyleContext',
                        detail: 'StyleContext',
                        docs: 'DOC?',
                        insert: 'StyleContext'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Class));
            }

            if (linePrefix.match(/Gdk\.\w*$/i)) {
				// --- Autocomplate Section ---
                return [
                    {
                        label: 'RGBA',
                        detail: 'RGBA()',
                        docs: 'DOC?',
                        insert: 'RGBA($1)'
                    },
                    {
                        label: 'Screen',
                        detail: 'Screen()',
                        docs: 'DOC?',
                        insert: 'Screen'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Class));
            }
            // * ------------------------------------------------------------ *

            // Auto-Complete Main Logic
            const VarMatchs = linePrefix.match(/(\w+)\.(\w*)$/)

            if (VarMatchs) {
                const varName = VarMatchs[1];
                let results = []; // Array for all

                // CssProvider
                if (getVarable(document, varName, 'CssProvider')) {
                    results.push(...GtkCssProvider, ...GObjectMethodInheartence, ...GtkStyleProvider);
                }

                // CssStyleContext
                if (getVarable(document, varName, 'StyleContext')) {
                    results.push(...GtkStyleContext, ...GObjectMethodInheartence);
                }

                // GdkScreen
                if (getVarableGDK(document, varName, 'Screen')) {
                    results.push(...GdkScreen, ...GObjectMethodInheartence);
                }

                // Label
                if (getVarable(document, varName, 'Label')) {
                    results.push(...GtkLabel, ...GtkMisk, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // AccelLabel
                if (getVarable(document, varName, 'AccelLabel')) {
                    results.push(...GtkAccelLabel, ...GtkLabel, ...GtkMisk, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // self
                if (linePrefix.match(/self\.\w*$/)) {
                    results.push(...GtkWindow, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkWidget, ...GtkContainer, ...GtkBin);
                }

                // Window
                if (getVarable(document, varName, 'Window')) {
                    results.push(...GtkWindow, ...GtkBin, ...GtkContainer, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkWidget);
                }

                // ActionBar
                if (getVarable(document, varName, 'ActionBar')) {
                    results.push(...GtkActionBar ,...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // Button
                if (getVarable(document, varName, 'Button')) {
                    results.push(...GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable);
                }

                // Box
                if (getVarable(document, varName, 'Box')) {
                    results.push(...GtkBox, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // Entry
                if (getVarable(document, varName, 'Entry')) {
                    results.push(...GtkEntry, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkCellEditable, ...GtkEditable);
                }

                // FileChooserButton
                if (getVarable(document, varName, 'FileChooserButton')) {
                    results.push(...GtkFileChooserButton, ...GtkBox, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable, ...GtkFileChooser);
                }

                // FileChooserDialog
                if (getVarable(document, varName, 'FileChooserDialog')) {
                    results.push(...GtkDialog, ...GtkWindow, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkFileChooser);
                }

                // FlowBox
                if (getVarable(document, varName, 'FlowBox')) {
                    results.push(...GtkFlowBox, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // FontButton
                if (getVarable(document, varName, 'FontButton')) {
                    results.push(...GtkFontButton, ...GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable, ...GtkFontChooser);
                }

                // FontChooserDialog
                if (getVarable(document, varName, 'FontChooserDialog')) {
                    results.push(...GtkDialog, ...GtkWindow, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkFontChooser);
                }

                // Frame
                if (getVarable(document, varName, 'Frame')) {
                    results.push(...GtkFrame, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // GLArea
                if (getVarable(document, varName, 'GLArea')) {
                    results.push(...GtkGLArea, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // Grid
                if (getVarable(document, varName, 'Grid')) {
                    results.push(...GtkGrid, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // HeaderBar
                if (getVarable(document, varName, 'HeaderBar')) {
                    results.push(...GtkHeaderBar, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // IconView
                if (getVarable(document, varName, 'IconView')) {
                    results.push(...GtkIconView, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkCellLayout, ...GtkScrollable);
                }

                // Image
                if (getVarable(document, varName, 'Image')) {
                    results.push(...GtkImage, ...GtkMisk, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // InfoBar
                if (getVarable(document, varName, 'InfoBar')) {
                    results.push(...GtkInfoBar, ...GtkBox, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // LevelBar
                if (getVarable(document, varName, 'LevelBar')) {
                    results.push(...GtkLevelBar, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // LinkButton
                if (getVarable(document, varName, 'LinkButton')) {
                    results.push(...GtkLinkButton, ...GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable);
                }

                // ListBox
                if (getVarable(document, varName, 'ListBox')) {
                    results.push(...GtkListBox, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // LockButton
                if (getVarable(document, varName, 'LockButton')) {
                    results.push(...GtkLockButton, ...GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable);
                }

                // MenuBar
                if (getVarable(document, varName, 'MenuBar')) {
                    results.push(...GtkMenuBar, ...GtkMenuShell, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // MenuButton
                if (getVarable(document, varName, 'MenuButton')) {
                    results.push(...GtkMenuButton, ...GtkToggleButton, ...GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable);
                }

                // MessageDialog
                if (getVarable(document, varName, 'MessageDialog')) {
                    results.push(...GtkMessageDialog, ...GtkDialog, ...GtkWindow, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // Notebook
                if (getVarable(document, varName, 'Notebook')) {
                    results.push(...GtkNotebook, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // Paned
                if (getVarable(document, varName, 'Paned')) {
                    results.push(...GtkPaned, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // PlacesSidebar
                if (getVarable(document, varName, 'PlacesSidebar')) {
                    results.push(...GtkPlacesSidebar, ...GtkScrolledWindow, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // ProgressBar
                if (getVarable(document, varName, 'ProgressBar')) {
                    results.push(...GtkProgressBar, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // RadioButton
                if (getVarable(document, varName, 'RadioButton')) {
                    results.push(...GtkRadioButton, ...GtkCheckButton, ...GtkToggleButton, ...GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable);
                }

                // RecentChooserDialog
                if (getVarable(document, varName, 'RecentChooserDialog')) {
                    results.push(...GtkDialog, ...GtkWindow, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkRecentChooser);
                }

                // Scale
                if (getVarable(document, varName, 'Scale')) {
                    results.push(...GtkScale, ...GtkRange, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // Scrollbar
                if (getVarable(document, varName, 'Scrollbar')) {
                    const GtkScrollbar = [
                        {
                            label: 'new',
                            detail: 'new(orientation, adjustment)',
                            docs: 'DOC?',
                            insert: 'new($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkScrollbar, ...GtkRange, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // ScrolledWindow
                if (getVarable(document, varName, 'ScrolledWindow')) {
                    results.push(...GtkScrolledWindow, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // SearchBar
                if (getVarable(document, varName, 'SearchBar')) {
                    results.push(...GtkSearchBar, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // SearchEntry
                if (getVarable(document, varName, 'SearchEntry')) {
                    results.push(...GtkSearchEntry, ...GtkEntry, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkCellEditable, ...GtkEditable);
                }

                // Separator
                if (getVarable(document, varName, 'Separator')) {
                    const GtkSeparator = [
                        {
                            label: 'new',
                            detail: 'new(orientation)',
                            docs: 'DOC?',
                            insert: 'new($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkSeparator, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // SpinButton
                if (getVarable(document, varName, 'SpinButton')) {
                    results.push(...GtkSpinButton, ...GtkEntry, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkCellEditable, ...GtkEditable, ...GtkOrientable);
                }
                
                // Spinner
                if (getVarable(document, varName, 'Spinner')) {
                    const GtkSpinner = [
                        {
                            label: 'new',
                            detail: 'new()',
                            docs: 'DOC?',
                            insert: 'new()'
                        },
                        {
                            label: 'start',
                            detail: 'start()',
                            docs: 'DOC?',
                            insert: 'start()'
                        },
                        {
                            label: 'stop',
                            detail: 'stop()',
                            docs: 'DOC?',
                            insert: 'stop()'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkSpinner, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // Stack
                if (getVarable(document, varName, 'Stack')) {
                    results.push(...GtkStack, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // StackSwitcher
                if (getVarable(document, varName, 'StackSwitcher')) {
                    const GtkStackSwitcher = [
                        {
                            label: 'new',
                            detail: 'new()',
                            docs: 'DOC?',
                            insert: 'new()'
                        },
                        {
                            label: 'get_stack',
                            detail: 'get_stack()',
                            docs: 'DOC?',
                            insert: 'get_stack()'
                        },
                        {
                            label: 'set_stack',
                            detail: 'set_stack(stack)',
                            docs: 'DOC?',
                            insert: 'set_stack($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkStackSwitcher, ...GtkBox, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // Statusbar
                if (getVarable(document, varName, 'Statusbar')) {
                    results.push(...GtkStatusbar, ...GtkBox, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable);
                }

                // Switch
                if (getVarable(document, varName, 'Switch')) {
                    const GtkSwitch = [
                        {
                            label: 'new',
                            detail: 'new()',
                            docs: 'DOC?',
                            insert: 'new()'
                        },
                        {
                            label: 'get_active',
                            detail: 'get_active()',
                            docs: 'DOC?',
                            insert: 'get_active()'
                        },
                        {
                            label: 'get_state',
                            detail: 'get_state()',
                            docs: 'DOC?',
                            insert: 'get_state()'
                        },
                        {
                            label: 'set_active',
                            detail: 'set_active(is_active)',
                            docs: 'DOC?',
                            insert: 'set_active($1)'
                        },
                        {
                            label: 'set_state',
                            detail: 'set_state(state)',
                            docs: 'DOC?',
                            insert: 'set_state($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkSwitch, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable);
                }

                // TextView
                if (getVarable(document, varName, 'TextView')) {
                    results.push(...GtkTextView, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkScrollable);
                }

                // ToggleButton
                if (getVarable(document, varName, 'ToggleButton')) {
                    results.push(...GtkToggleButton, GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable);
                }

                // ToolPalette
                if (getVarable(document, varName, 'ToolPalette')) {
                    results.push(...GtkToolPalette, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable, ...GtkScrollable);
                }

                // Toolbar
                if (getVarable(document, varName, 'Toolbar')) {
                    results.push(...GtkToolbar, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkOrientable, ...GtkToolShell);
                }

                // ToolItemGroup
                if (getVarable(document, varName, 'ToolItemGroup')) {
                    results.push(...GtkToolItemGroup, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkToolShell);
                }

                // TreeView
                if (getVarable(document, varName, 'TreeView')) {
                    results.push(...GtkTreeView, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkScrollable);
                }

                // VolumeButton
                if (getVarable(document, varName, 'VolumeButton')) {
                    const GtkVolumeButton = [
                        {
                            label: 'new',
                            detail: 'new()',
                            docs: 'DOC?',
                            insert: 'new()'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkVolumeButton, ...GtkScaleButton, ...GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable, ...GtkOrientable);
                }

                // AboutDialog
                if (getVarable(document, varName, 'AboutDialog')) {
                    const GtkAboutDialog = [
                        {
                            label: 'new',
                            detail: 'new()',
                            docs: 'DOC?',
                            insert: 'new()'
                        },
                        {
                            label: 'add_credit_section',
                            detail: 'add_credit_section(section_name, people)',
                            docs: 'DOC?',
                            insert: 'add_credit_section($1)'
                        },
                        {
                            label: 'get_artists',
                            detail: 'get_artists()',
                            docs: 'DOC?',
                            insert: 'get_artists()'
                        },
                        {
                            label: 'get_authors',
                            detail: 'get_authors()',
                            docs: 'DOC?',
                            insert: 'get_authors()'
                        },
                        {
                            label: 'get_comments',
                            detail: 'get_comments()',
                            docs: 'DOC?',
                            insert: 'get_comments()'
                        },
                        {
                            label: 'get_copyright',
                            detail: 'get_copyright()',
                            docs: 'DOC?',
                            insert: 'get_copyright()'
                        },
                        {
                            label: 'get_documenters',
                            detail: 'get_documenters()',
                            docs: 'DOC?',
                            insert: 'get_documenters()'
                        },
                        {
                            label: 'get_license',
                            detail: 'get_license()',
                            docs: 'DOC?',
                            insert: 'get_license()'
                        },
                        {
                            label: 'get_license_type',
                            detail: 'get_license_type()',
                            docs: 'DOC?',
                            insert: 'get_license_type()'
                        },
                        {
                            label: 'get_logo',
                            detail: 'get_logo()',
                            docs: 'DOC?',
                            insert: 'get_logo()'
                        },
                        {
                            label: 'get_logo_icon_name',
                            detail: 'get_logo_icon_name()',
                            docs: 'DOC?',
                            insert: 'get_logo_icon_name()'
                        },
                        {
                            label: 'get_program_name',
                            detail: 'get_program_name()',
                            docs: 'DOC?',
                            insert: 'get_program_name()'
                        },
                        {
                            label: 'get_translator_credits',
                            detail: 'get_translator_credits()',
                            docs: 'DOC?',
                            insert: 'get_translator_credits()'
                        },
                        {
                            label: 'get_version',
                            detail: 'get_version()',
                            docs: 'DOC?',
                            insert: 'get_version()'
                        },
                        {
                            label: 'get_website',
                            detail: 'get_website()',
                            docs: 'DOC?',
                            insert: 'get_website()'
                        },
                        {
                            label: 'get_website_label',
                            detail: 'get_website_label()',
                            docs: 'DOC?',
                            insert: 'get_website_label()'
                        },
                        {
                            label: 'get_wrap_license',
                            detail: 'get_wrap_license()',
                            docs: 'DOC?',
                            insert: 'get_wrap_license()'
                        },
                        {
                            label: 'set_artists',
                            detail: 'set_artists(artists)',
                            docs: 'DOC?',
                            insert: 'set_artists($1)'
                        },
                        {
                            label: 'set_authors',
                            detail: 'set_authors(authors)',
                            docs: 'DOC?',
                            insert: 'set_authors($1)'
                        },
                        {
                            label: 'set_comments',
                            detail: 'set_comments(comments)',
                            docs: 'DOC?',
                            insert: 'set_comments($1)'
                        },
                        {
                            label: 'set_copyright',
                            detail: 'set_copyright(copyright)',
                            docs: 'DOC?',
                            insert: 'set_copyright($1)'
                        },
                        {
                            label: 'set_documenters',
                            detail: 'set_documenters(documenters)',
                            docs: 'DOC?',
                            insert: 'set_documenters($1)'
                        },
                        {
                            label: 'set_license',
                            detail: 'set_license(license)',
                            docs: 'DOC?',
                            insert: 'set_license($1)'
                        },
                        {
                            label: 'set_license_type',
                            detail: 'set_license_type(license_type)',
                            docs: 'DOC?',
                            insert: 'set_license_type($1)'
                        },
                        {
                            label: 'set_logo',
                            detail: 'set_logo(logo)',
                            docs: 'DOC?',
                            insert: 'set_logo($1)'
                        },
                        {
                            label: 'set_logo_icon_name',
                            detail: 'set_logo_icon_name(icon_name)',
                            docs: 'DOC?',
                            insert: 'set_logo_icon_name($1)'
                        },
                        {
                            label: 'set_program_name',
                            detail: 'set_program_name(name)',
                            docs: 'DOC?',
                            insert: 'set_program_name($1)'
                        },
                        {
                            label: 'set_translator_credits',
                            detail: 'set_translator_credits(translator_credits)',
                            docs: 'DOC?',
                            insert: 'set_translator_credits($1)'
                        },
                        {
                            label: 'set_version',
                            detail: 'set_version(version)',
                            docs: 'DOC?',
                            insert: 'set_version($1)'
                        },
                        {
                            label: 'set_website',
                            detail: 'set_website(website)',
                            docs: 'DOC?',
                            insert: 'set_website($1)'
                        },
                        {
                            label: 'set_website_label',
                            detail: 'set_website_label(website_label)',
                            docs: 'DOC?',
                            insert: 'set_website_label($1)'
                        },
                        {
                            label: 'set_wrap_license',
                            detail: 'set_wrap_license(wrap_license)',
                            docs: 'DOC?',
                            insert: 'set_wrap_license($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkAboutDialog, ...GtkDialog, ...GtkWindow, ...GtkBin, ...GtkContainer, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkWidget);
                }

                //AppChooserButton
                if (getVarable(document, varName, 'AppChooserButton')){
                    results.push(...GtkAppChooserButton, ...GtkComboBox, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkCellEditable, ...GtkCellLayout, ...GtkAppChooser);
                }

                // AppChooserDialog
                if (getVarable(document, varName, 'AppChooserDialog')){
                    const GtkAppChooserDialog = [
                        {
                            label: 'new',
                            detail: 'new(parent, flags, file)',
                            docs: 'DOC?',
                            insert: 'new($1)'
                        },
                        {
                            label: 'new_for_content_type',
                            detail: 'new_for_content_type(parent, flags, content_type)',
                            docs: 'DOC?',
                            insert: 'new_for_content_type($1)'
                        },
                        {
                            label: 'get_heading',
                            detail: 'get_heading()',
                            docs: 'DOC?',
                            insert: 'get_heading()'
                        },
                        {
                            label: 'get_widget',
                            detail: 'get_widget()',
                            docs: 'DOC?',
                            insert: 'get_widget()'
                        },
                        {
                            label: 'set_heading',
                            detail: 'set_heading(heading)',
                            docs: 'DOC?',
                            insert: 'set_heading($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkAppChooserDialog ,...GtkDialog, ...GtkWindow, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkAppChooser);
                }

                //GtkAssistant
                if (getVarable(document, varName, 'Assistant')){
                    const GtkAssistant = [
                        {
                            label: 'new',
                            detail: 'new()',
                            docs: 'DOC?',
                            insert: 'new()'
                        },
                        {
                            label: 'add_action_widget',
                            detail: 'add_action_widget(child)',
                            docs: 'DOC?',
                            insert: 'add_action_widget($1)'
                        },
                        {
                            label: 'append_page',
                            detail: 'append_page(page)',
                            docs: 'DOC?',
                            insert: 'append_page($1)'
                        },
                        {
                            label: 'commit',
                            detail: 'commit()',
                            docs: 'DOC?',
                            insert: 'commit()'
                        },
                        {
                            label: 'get_current_page',
                            detail: 'get_current_page()',
                            docs: 'DOC?',
                            insert: 'get_current_page()'
                        },
                        {
                            label: 'get_n_pages',
                            detail: 'get_n_pages()',
                            docs: 'DOC?',
                            insert: 'get_n_pages()'
                        },
                        {
                            label: 'get_nth_page',
                            detail: 'get_nth_page(page_num)',
                            docs: 'DOC?',
                            insert: 'get_nth_page($1)'
                        },
                        {
                            label: 'get_page_complete',
                            detail: 'get_page_complete(page)',
                            docs: 'DOC?',
                            insert: 'get_page_complete($1)'
                        },
                        {
                            label: 'get_page_has_padding',
                            detail: 'get_page_has_padding(page)',
                            docs: 'DOC?',
                            insert: 'get_page_has_padding($1)'
                        },
                        {
                            label: 'get_page_header_image',
                            detail: 'get_page_header_image(page)',
                            docs: 'DOC?',
                            insert: 'get_page_header_image($1)'
                        },
                        {
                            label: 'get_page_side_image',
                            detail: 'get_page_side_image(page)',
                            docs: 'DOC?',
                            insert: 'get_page_side_image($1)'
                        },
                        {
                            label: 'get_page_title',
                            detail: 'get_page_title(page)',
                            docs: 'DOC?',
                            insert: 'get_page_title($1)'
                        },
                        {
                            label: 'get_page_type',
                            detail: 'get_page_type(page)',
                            docs: 'DOC?',
                            insert: 'get_page_type($1)'
                        },
                        {
                            label: 'insert_page',
                            detail: 'insert_page(page, position)',
                            docs: 'DOC?',
                            insert: 'insert_page($1)'
                        },
                        {
                            label: 'next_page',
                            detail: 'next_page()',
                            docs: 'DOC?',
                            insert: 'next_page()'
                        },
                        {
                            label: 'prepend_page',
                            detail: 'prepend_page(page)',
                            docs: 'DOC?',
                            insert: 'prepend_page($1)'
                        },
                        {
                            label: 'previous_page',
                            detail: 'previous_page()',
                            docs: 'DOC?',
                            insert: 'previous_page()'
                        },
                        {
                            label: 'remove_action_widget',
                            detail: 'remove_action_widget(child)',
                            docs: 'DOC?',
                            insert: 'remove_action_widget($1)'
                        },
                        {
                            label: 'remove_page',
                            detail: 'remove_page(page_num)',
                            docs: 'DOC?',
                            insert: 'remove_page($1)'
                        },
                        {
                            label: 'set_current_page',
                            detail: 'set_current_page(page_num)',
                            docs: 'DOC?',
                            insert: 'set_current_page($1)'
                        },
                        {
                            label: 'set_forward_page_func',
                            detail: 'set_forward_page_func(page_func, *data)',
                            docs: 'DOC?',
                            insert: 'set_forward_page_func($1)'
                        },
                        {
                            label: 'set_page_complete',
                            detail: 'set_page_complete(page, complete)',
                            docs: 'DOC?',
                            insert: 'set_page_complete($1)'
                        },
                        {
                            label: 'set_page_has_padding',
                            detail: 'set_page_has_padding(page, has_padding)',
                            docs: 'DOC?',
                            insert: 'set_page_has_padding($1)'
                        },
                        {
                            label: 'set_page_header_image',
                            detail: 'set_page_header_image(page, pixbuf)',
                            docs: 'DOC?',
                            insert: 'set_page_header_image($1)'
                        },
                        {
                            label: 'set_page_side_image',
                            detail: 'set_page_side_image(page, pixbuf)',
                            docs: 'DOC?',
                            insert: 'set_page_side_image($1)'
                        },
                        {
                            label: 'set_page_title',
                            detail: 'set_page_title(page, title)',
                            docs: 'DOC?',
                            insert: 'set_page_title($1)'
                        },
                        {
                            label: 'set_page_type',
                            detail: 'set_page_type(page, type)',
                            docs: 'DOC?',
                            insert: 'set_page_type($1)'
                        },
                        {
                            label: 'update_buttons_state',
                            detail: 'update_buttons_state()',
                            docs: 'DOC?',
                            insert: 'update_buttons_state()'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkAssistant ,...GtkWindow, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence);
                }

                // CheckButton
                if (getVarable(document, varName, 'CheckButton')){
                    results.push(...GtkCheckButton, ...GtkToggleButton, ...GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable);
                }

                // ColorButton
                if (getVarable(document, varName, 'ColorButton')){
                    results.push(...GtkColorButton, ...GtkButton, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkActionable, ...GtkActivatable, ...GtkColorChooser);
                }

                // ColorChooserWidget
                if (getVarable(document, varName, 'ColorChooserWidget')){
                    results.push(...GtkColorChooser);
                }

                // ColorChooserDialog
                if (getVarable(document, varName, 'ColorChooserDialog')){
                    const GtkColorChooserDialog = [
                        {
                            label: 'new',
                            detail: 'new()',
                            docs: 'DOC?',
                            insert: 'new()'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...GtkColorChooserDialog, ...GtkDialog, ...GtkWindow, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkColorChooser);
                }

                // ComboBox
                if (getVarable(document, varName, 'ComboBox')){
                    results.push(...GtkComboBox, ...GtkBin, ...GtkContainer, ...GtkWidget, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkCellEditable, ...GtkCellLayout);
                }

                // ListStore
                if (getVarable(document, varName, 'ListStore')){
                    results.push(...GtkListStore, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkTreeDragDest, ...GtkTreeDragSource, ...GtkTreeModel, ...GtkTreeSortable);
                }

                // All Suggests
                if (results.length > 0) {
                    return results;
                }
            }
            // ------------------------------------------------------------


            // Completion The `"__main__"` ================================
            if (linePrefix.match(/__name__\s*==\s*["'\w_]*$/)){
                return [
                    {
                        label: '__main__',
                        detail: '__main__',
                        docs: 'DOC?',
                        insert: '"__main__"'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Keyword))
            }
            // -------------------------------------------------------------


            // Custom Widgets ==============================================
            if (linePrefix.match(/GObject\.\w*$/)){
                return [
                    {
                        label: 'Object',
                        detail: 'Object',
                        docs: 'DOC?',
                        insert: 'Object'
                    },
                    {
                        label: 'BindingFlags',
                        detail: 'BindingFlags',
                        docs: 'DOC?',
                        insert: 'BindingFlags'
                    },
                    {
                        label: 'Property',
                        detail: 'Property',
                        docs: 'DOC?',
                        insert: 'Property($1)'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Method))
            }

            // suggest after any Widget.get_style_context()
            const get_style_context_result = [];
            if (linePrefix.match(/get_style_context\(\)\.\w*$/)) {
                get_style_context_result.push(...GtkStyleContext, ...GObjectMethodInheartence);
            }
            if (get_style_context_result.length > 0) {
                return get_style_context_result;
            }

            if (linePrefix.match(/AssistantPageType\.\w*$/)){
                return [
                    {
                        label: 'INTRO',
                        detail: 'INTRO',
                        docs: 'DOC?',
                        insert: 'INTRO'
                    },
                    {
                        label: 'CONFIRM',
                        detail: 'CONFIRM',
                        docs: 'DOC?',
                        insert: 'CONFIRM'
                    },
                    {
                        label: 'SUMMARY',
                        detail: 'SUMMARY',
                        docs: 'DOC?',
                        insert: 'SUMMARY'
                    },
                    {
                        label: 'CONTENT',
                        detail: 'CONTENT',
                        docs: 'DOC?',
                        insert: 'CONTENT'
                    },
                    {
                        label: 'PROGRESS',
                        detail: 'PROGRESS',
                        docs: 'DOC?',
                        insert: 'PROGRESS'
                    },
                    {
                        label: 'CUSTOM',
                        detail: 'CUSTOM',
                        docs: 'DOC?',
                        insert: 'CUSTOM'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.EnumMember))
            }

            if (linePrefix.match(/ResponseType\.\w*$/)){
                return [
                    {
                        label: 'OK',
                        detail: 'OK',
                        docs: 'DOC?',
                        insert: 'OK'
                    },
                    {
                        label: 'CANCEL',
                        detail: 'CANCEL',
                        docs: 'DOC?',
                        insert: 'CANCEL'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.EnumMember))
            }

            if (linePrefix.match(/Property\(\w*$/)){
                return [
                    {
                        label: 'type',
                        detail: 'type',
                        docs: 'DOC?',
                        insert: 'type=$1'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property))
            }

            if (linePrefix.match(/Property\(\s*\w+\s*=\s*[^)]*,\s*$/)) {
                return [
                    {
                        label: 'default',
                        detail: 'default',
                        docs: 'DOC?',
                        insert: 'default="$1"'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property))
            }

            const matchBind = linePrefix.match(/(?:self\.)?(\w+)\.$/);
            const VarName = matchBind ? matchBind[1] : null;
            if (VarName && GetVariable(document, VarName, 'bind_property')) {
                return [
                    {
                        label: 'unbind',
                        detail: 'unbind()',
                        docs: 'DOC?',
                        insert: 'unbind()'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Method));
            }

            // BindingFlags Method
            if (linePrefix.match(/BindingFlags\.\w*$/)){
                return [
                    {
                        label: 'DEFAULT',
                        detail: 'DEFAULT',
                        docs: 'DOC?',
                        insert: 'DEFAULT'
                    },
                    {
                        label: 'BIDIRECTIONAL',
                        detail: 'BIDIRECTIONAL',
                        docs: 'DOC?',
                        insert: 'BIDIRECTIONAL'
                    },
                    {
                        label: 'SYNC_CREATE',
                        detail: 'SYNC_CREATE',
                        docs: 'DOC?',
                        insert: 'SYNC_CREATE'
                    },
                    {
                        label: 'INVERT_BOOLEAN',
                        detail: 'INVERT_BOOLEAN',
                        docs: 'DOC?',
                        insert: 'INVERT_BOOLEAN'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Method));
            }

            // WindowCompletion
            if (linePrefix.match(/Window\.\w*$/)){
                return [
                    {
                        label: '__init__',
                        detail: '__init__()',
                        docs: 'DOC?',
                        insert: '__init__($1)'
                    },
                    {
                        label: 'set_default_icon_name',
                        detail: 'set_default_icon_name("")',
                        docs: 'DOC?',
                        insert: 'set_default_icon_name("$1")'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Method));
            }

            if (linePrefix.match(/Window\.__init__\(\w*$/)){
                return [
                    {
                        label: 'title',
                        detail: 'title=""',
                        docs: 'DOC?',
                        insert: 'title="$1"'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property));
            }

            if (linePrefix.match(/Window\.__init__\(\s*self\s*,\s{0,1}\w*$/)){
                return [
                    {
                        label: 'title',
                        detail: 'title=""',
                        docs: 'DOC?',
                        insert: 'title="$1"'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property));
            }

            // WindowPosition Props
            if (linePrefix.match(/WindowPosition\.\w*$/)){
                return [
                    {
                        label: 'NONE',
                        detail: 'NONE',
                        docs: 'DOC?',
                        insert: 'NONE'
                    },
                    {
                        label: 'CENTER',
                        detail: 'CENTER',
                        docs: 'DOC?',
                        insert: 'CENTER'
                    },
                    {
                        label: 'MOUSE',
                        detail: 'MOUSE',
                        docs: 'DOC?',
                        insert: 'MOUSE'
                    },
                    {
                        label: 'CENTER_ALWAYS',
                        detail: 'CENTER_ALWAYS',
                        docs: 'DOC?',
                        insert: 'CENTER_ALWAYS'
                    },
                    {
                        label: 'CENTER_ON_PARENT',
                        detail: 'CENTER_ON_PARENT',
                        docs: 'DOC?',
                        insert: 'CENTER_ON_PARENT'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.EnumMember))
            }

            // CheckButton args
            if (linePrefix.match(/CheckButton\s*\(\s*\w*$/)) {
                return [
                    {
                        label: 'label',
                        detail: 'label="[str]"',
                        docs: 'DOC?',
                        insert: 'label="$1"'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property))
            }

            // Orientation Props
            if (linePrefix.match(/Orientation\.\w*$/)) {
                return [
                    {
                        label: 'VERTICAL',
                        detail: 'Orientation.VERTICAL',
                        docs: 'DOC?',
                        insert: 'VERTICAL'
                    },
                    {
                        label: 'HORIZONTAL',
                        detail: 'Orientation.HORIZONTAL',
                        docs: 'DOC?',
                        insert: 'HORIZONTAL'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property))
            }

            // Align Props
            if (linePrefix.match(/Align\.\w*$/)) {
                return [
                    {
                        label: 'CENTER',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'CENTER'
                    },
                    {
                        label: 'BASELINE',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'BASELINE'
                    },
                    {
                        label: 'FILL',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'FILL'
                    },
                    {
                        label: 'START',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'START'
                    },
                    {
                        label: 'END',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'END'
                    },
                ].map(s => createItem(s, vscode.CompletionItemKind.Property))
            }

            if (linePrefix.match(/label\s*=\s*".*?"\s*,\s*$/)) {
                return [
                    {
                        label: 'angle',
                        detail: 'angle=int',
                        docs: 'DOC?',
                        insert: 'angle='
                    },
                ].map(s => createItem(s, vscode.CompletionItemKind.Property))
            }
            // ------------------------------------------------------------

			if (linePrefix.match(/def\s+\w*$/)) {
				return [
					{
						label: '__init__',
						detail: 'def __init__(self):',
						docs: 'DOC?',
						insert: '__init__(self):'
					}
				].map(s => createItem(s, vscode.CompletionItemKind.Function))
			}
            //suggests 'widget' if create a function with 'self' and ',' in brackets. 
            if (linePrefix.match(/def\s+\w+\(self,\s*$/)) {
                return [
                    {
                        label: 'widget',
                        detail: 'Common parameter for GTK signals',
                        docs: 'DOC?',
                        insert: 'widget'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Variable));
            }

            if (linePrefix.match(/def\s+\w+\(\s*$/)) {
                return [
                    {
                        label: 'button',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'button'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Variable));
            }
            
            if (linePrefix.match(/super\(\)\.\w*$/)) {
                return [
                    {
                        label: '__init__',
                        detail: 'super().__init__(title="")',
                        docs: 'DOC?',
                        insert: '__init__(title="$1")'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Method));
            }

            if (linePrefix.match(/super\(\)\.__init__\(\w*$/)) {
                return [
                    {
                        label: 'title',
                        detail: 'super().__init__(title="")',
                        docs: 'DOC?',
                        insert: 'title="$1"'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property))
            }

            if (linePrefix.match(/GdkPixbuf\.\w*$/)){
                return [
                    {
                        label: 'Pixbuf',
                        detail: 'Pixbuf',
                        docs: 'DOC?',
                        insert: 'Pixbuf'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Method));
            }

            if (linePrefix.match(/Pixbuf\.\w*$/)){
                return [
                    {
                        label: 'new_from_file',
                        detail: 'new_from_file',
                        docs: 'DOC?',
                        insert: 'new_from_file($1)'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Method));
            }

            // Auto Pics From the Project ---
            if (linePrefix.match(/new_from_file\(\s*["']?$/)){
                return vscode.workspace.findFiles('**/*.{png,jpg,jpeg,svg}', '**/node_modules/**').then(files => {
                    return files.map(file => {
                        const relativePath = vscode.workspace.asRelativePath(file);
                        const item = new vscode.CompletionItem(relativePath, vscode.CompletionItemKind.File);
                        item.detail = "ac | File Path";
                        item.documentation = new vscode.MarkdownString(`**AC-GTK:** \n\n File Path. \`${relativePath}\``);

                        if (linePrefix.endsWith('"') || linePrefix.endsWith("'")) {
                            item.insertText = new vscode.SnippetString(`${relativePath}$1`);
                        } else {
                            item.insertText = new vscode.SnippetString(`${relativePath}$1`);
                        }
                        return item;
                    });
                });
            }
            // -----
            
            // props for widgets
            const ctorMatch = linePrefix.match(/(Window|Button|Box|Label|Entry)\((?:[^,]*,\s{0,2})*(\w*)$/);

            if (ctorMatch) {
                const widgetType = ctorMatch[1];
                const insideArgs = ctorMatch[2];
                let argsRes = [];

                const commonGtkArgs = [
                    {
                        label: 'halign',
                        detail: 'halign=[Gtk.Align]',
                        docs: 'DOC?',
                        insert: 'halign=$1'
                    },
                    {
                        label: 'valign',
                        detail: 'valign=[Gtk.Align]',
                        docs: 'DOC?',
                        insert: 'valign=$1'
                    },
                    {
                        label: 'sensitive',
                        detail: 'sensitive=[bool]',
                        docs: 'DOC?',
                        insert: 'sensitive=$1'
                    },
                ].map(s => createItem(s, vscode.CompletionItemKind.Property));
                argsRes.push(...commonGtkArgs);

                // Window args
                if (widgetType === 'Window') {
                    argsRes.push(...[
                        {
                            label: 'title',
                            detail: 'Gtk.Window(title="")',
                            docs: 'DOC?',
                            insert: 'title="$1"'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Property)));
                }

                // Label args
                if (widgetType === 'Label') {
                    argsRes.push(...[
                        {
                            label: 'label',
                            detail: 'label="[str]"',
                            docs: 'DOC?',
                            insert: 'label="$1"'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Property)));
                }

                // Box args
                if (widgetType === 'Box') {
                argsRes.push(...[
                    {
                        label: 'orientation',
                        detail: 'orientation=',
                        docs: 'DOC?',
                        insert: 'orientation='
                    },
                    {
                        label: 'spacing',
                        detail: 'spacing=',
                        docs: 'DOC?',
                        insert: 'spacing=$1'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property)));
            }

            // bind_property
            if (widgetType === 'bind_property') {
                argsRes.push(...[
                    
                ].map(s => createItem(s, vscode.CompletionItemKind.Property)));
            }
                
                return argsRes;
            }

            if (linePrefix.match(/set_property\("?$/)) {
                return [
                    {
                        label: '"angle"',
                        detail: '"angle"',
                        docs: 'DOC?',
                        insert: '"angle"'
                    }
                ].map(s => {
                    let item = createItem(s, vscode.CompletionItemKind.Enum);

                    if (linePrefix.endsWith('"')) {
                        item.insertText = new vscode.SnippetString(s.insert.substring(1, s.insert.length - 1));
                    }
                    return item;
                });
            }

            if (linePrefix.match(/props\.\w*$/)) {
                return [
                    {
                        label: 'label',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'label'
                    },
                    {
                        label: 'placeholder_text',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'placeholder_text'
                    },
                    {
                        label: 'title',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'title'
                    },
                    {
                        label: 'sensitive',
                        detail: 'AC-GTK',
                        docs: 'DOC?',
                        insert: 'sensitive'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property))
            }

            if (linePrefix.match(/connect\("?$/)) {
                return [
                    {
                        label: '"destroy"',
                        detail: '"destroy"',
                        docs: 'DOC?',
                        insert: '"destroy"'
                    },
                    {
                        label: '"clicked"',
                        detail: '"clicked"',
                        docs: 'DOC?',
                        insert: '"clicked"'
                    },
                    {
                        label: '"delete-event"',
                        detail: '"delete-event"',
                        docs: 'DOC?',
                        insert: '"delete-event"'
                    },
                    {
                        label: '"color-set"',
                        detail: '"color-set"',
                        docs: 'DOC?',
                        insert: '"color-set"'
                    },
                    {
                        label: '"notify::rgba"',
                        detail: '"notify::rgba"',
                        docs: 'DOC?',
                        insert: '"notify::rgba"'
                    },
                    {
                        label: '"changed"',
                        detail: '"changed"',
                        docs: 'DOC?',
                        insert: '"changed"'
                    },
                    {
                        label: '"file-set"',
                        detail: '"file-set"',
                        docs: 'DOC?',
                        insert: '"file-set"'
                    }
                ].map(s => {
                    let item = createItem(s, vscode.CompletionItemKind.Enum);

                    if (linePrefix.endsWith('"')) {
                        item.insertText = new vscode.SnippetString(s.insert.substring(1, s.insert.length - 1));
                    }
                    return item;
                });
            }

            if (linePrefix.match(/bind_property\((?:"[^"\)]*|[^,]+,\s*(?:self\.)?\w+,\s*(?:"[^"\)]*)?)$/)) {
                return [
                    {
                        label: '"text"',
                        detail: '"text"',
                        docs: 'DOC?',
                        insert: '"text"'
                    },
                    {
                        label: '"label"',
                        detail: '"label"',
                        docs: 'DOC?',
                        insert: '"label"'
                    },
                    {
                        label: '"value"',
                        detail: '"value"',
                        docs: 'DOC?',
                        insert: '"value"'
                    },
                    {
                        label: '"active"',
                        detail: '"active"',
                        docs: 'DOC?',
                        insert: '"active"'
                    },
                    {
                        label: '"visible"',
                        detail: '"visible"',
                        docs: 'DOC?',
                        insert: '"visible"'
                    },
                    {
                        label: '"sensitive"',
                        detail: '"sensitive"',
                        docs: 'DOC?',
                        insert: '"sensitive"'
                    }
                ].map(s => {
                    let item = createItem(s, vscode.CompletionItemKind.Enum);

                    if (linePrefix.endsWith('"')){
                        item.insertText = new vscode.SnippetString(s.insert.substring(1, s.insert.length - 1));
                    }
                    return item
                });
            }

            if (linePrefix.match(/connect\(".*",\s*$/)) {
                return [
                    {
                        label: 'Gtk',
                        detail: '"destroy", Gtk',
                        docs: 'DOC?',
                        insert: 'Gtk'
                    },
                    {
                        label: 'self',
                        detail: '"clicked", self.`function`',
                        docs: 'DOC?',
                        insert: 'self'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Method));
            }

            if (linePrefix.match(/Button\(\w*$/i)) {
                return [
                    {
                        label: 'label',
                        detail: 'Gtk.Button(label"")',
                        docs: 'DOC?',
                        insert: 'label="$1"'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property));
            }

            // Advanced !G
            const lineText = document.lineAt(position.line).text;
            const trimmedText = lineText.trim();

            if (trimmedText.startsWith('!') && !lineText.includes('#')) {
                if (trimmedText === '!' || trimmedText === '!G') {
                    const range = new vscode.Range(position.translate(0, -trimmedText.length), position);
                    const boilerplate = new vscode.CompletionItem('!G', vscode.CompletionItemKind.Snippet);
                    boilerplate.detail = "Creating structure";
                    boilerplate.range = range;
                    boilerplate.documentation = new vscode.MarkdownString("Creating the complete basic structure of the application.");

                    boilerplate.insertText = new vscode.SnippetString([
                        "import gi",
                        "gi.require_version('Gtk', '3.0')",
                        "from gi.repository import Gtk${1}",
                        "",
                        "class CLASS_NAME(Gtk.Window):",
                        "    def __init__(self):",
                        "       super().__init__(title=\"${2:APP NAME}\")",
                        "       self.set_default_size(${3:800}, ${4:600})",
                        "       ",
                        "       ${5}",
                        "       ",
                        "win = CLASS_NAME()",
                        "win.connect(\"destroy\", Gtk.main_quit)",
                        "win.show_all()",
                        "Gtk.main()"
                    ].join('\n'));

                    return [boilerplate]
                }
            }

            return undefined;
        }
    //Trigger ↓ - ↓ - ↓ 
    }, '.', ' ', '!', '(', ',', '"');

    context.subscriptions.push(provider);
}

// --- Create New Item ---
function createItem(s, kind) {
    const item = new vscode.CompletionItem(s.label, kind);
    item.detail = s.detail || '';
    item.documentation = new vscode.MarkdownString(`**AC-GTK:**\n\n${s.docs}`);
    item.insertText = new vscode.SnippetString(s.insert);
	// Sort Up
	item.sortText = `00_${s.label}`
    return item;
}
//get varaible and confirm it, for example 'Gtk.Window' to auto connect.
function getVarable(document, varName, gtkType) {
    const fullText = document.getText();
    const classMatch = new RegExp(`(?:self\\.)?${varName}\\s*=\\s*(\\w+)`, 'g').exec(fullText);

    if (classMatch) {
        const className = classMatch[1];
        const isInherited = new RegExp(`class\\s+${className}\\s*\\(\\s*Gtk\\.${gtkType}\\s*\\)`, 'g').test(fullText);
        const isDirect = new RegExp(`(?:self\\.)?${varName}\\s*=\\s*Gtk\\.${gtkType}`, 'g').test(fullText);
        
        return isInherited || isDirect;
    }
    return new RegExp(`(?:self\\.)?${varName}\\s*=\\s*Gtk\\.${gtkType}`, 'g').test(fullText);
}

//get varaible and confirm it, for example 'Gtk.Window' to auto connect.
function getVarableGDK(document, varName, gtkType) {
    const fullText = document.getText();
    const classMatch = new RegExp(`(?:self\\.)?${varName}\\s*=\\s*(\\w+)`, 'g').exec(fullText);

    if (classMatch) {
        const className = classMatch[1];
        const isInherited = new RegExp(`class\\s+${className}\\s*\\(\\s*Gdk\\.${gtkType}\\s*\\)`, 'g').test(fullText);
        const isDirect = new RegExp(`(?:self\\.)?${varName}\\s*=\\s*Gdk\\.${gtkType}`, 'g').test(fullText);
        
        return isInherited || isDirect;
    }
    return new RegExp(`(?:self\\.)?${varName}\\s*=\\s*Gdk\\.${gtkType}`, 'g').test(fullText);
}

// any variable can auto connect
/**
 * @param {vscode.TextDocument} document
 * @param {string} VarName
 * @param {string} methodName
 */

function GetVariable(document, VarName, methodName){
    const fullText = document.getText();
    const escapeVar = VarName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const pattern = new RegExp(
        `(?:self\\.)?${escapeVar}\\s*(?:\\.\\s*${methodName}\\(|\\s*=\\s*(?:self\\.)?\\w+\\.${methodName}\\()`,
        'i'
    );
    return pattern.test(fullText)
}

function deactivate() {}

module.exports = { activate, deactivate };