
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

            // -----------*-----------


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
                ].map(s => createItem(s, vscode.CompletionItemKind.Class));
            }
            // * ------------------------------------------------------------ *

            // Auto-Complete Main Logic
            const VarMatchs = linePrefix.match(/(\w+)\.(\w*)$/)

            if (VarMatchs) {
                const varName = VarMatchs[1];
                let results = []; // Array for all

                const gtkTypes = ['Window', 'Button', 'Box', 'Label', 'Entry'];
                const isGtk = gtkTypes.some(type => getVarable(document, varName, type));

                // Gtk
                if (isGtk) {
                    const commonGtkMethods = [
                        {
                            label: 'set_halign',
                            detail: 'set_halign()',
                            docs: 'DOC?',
                            insert: 'set_halign($1)'
                        },
                        {
                            label: 'set_valign',
                            detail: 'set_valign()',
                            docs: 'DOC?',
                            insert: 'set_valign($1)'
                        },
                        {
                            label: 'set_sensitive',
                            detail: 'set_sensitive(bool)',
                            docs: 'DOC?',
                            insert: 'set_sensitive($1)'
                        },
                        {
                            label: 'set_margin_start',
                            detail: 'set_margin_start(int)',
                            docs: 'DOC?',
                            insert: 'set_margin_start($1)'
                        },
                        {
                            label: 'set_margin_end',
                            detail: 'set_margin_end(int)',
                            docs: 'DOC?',
                            insert: 'set_margin_end($1)'
                        },
                        {
                            label: 'set_margin_top',
                            detail: 'set_margin_top(int)',
                            docs: 'DOC?',
                            insert: 'set_margin_top($1)'
                        },
                        {
                            label: 'set_margin_bottom',
                            detail: 'set_margin_bottom(int)',
                            docs: 'DOC?',
                            insert: 'set_margin_bottom($1)'
                        },
                        {
                            label: 'disconnect_by_func',
                            detail: 'Widget.disconnect_by_func()',
                            docs: 'DOC?',
                            insert: 'disconnect_by_func($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...commonGtkMethods, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkWidget);
                }

                // Label
                if (getVarable(document, varName, 'Label')) {
                    results.push(...GtkLabel);
                }

                // AccelLabel
                if (getVarable(document, varName, 'AccelLabel')) {
                    results.push(...GtkMisk, ...GtkLabel, ...GtkAccelLabel, ...GtkWidget)
                }

                // self
                if (linePrefix.match(/self\.\w*$/)) {
                    results.push(...GtkWindow, ...GObjectMethodInheartence, ...GtkBuildableInheartence, ...GtkWidget, ...GtkContainer, ...GtkBin)
                }

                // Window
                if (getVarable(document, varName, 'Window')) {
                    results.push(...GtkWindow, ...GtkContainer, ...GtkBin)
                }

                // ActionBar
                if (getVarable(document, varName, 'ActionBar')) {
                    results.push(...GtkContainer, ...GtkBin, ...GtkActionBar)
                }

                // Button
                if (getVarable(document, varName, 'Button')) {
                    const buttonGtk = [
                        {
                            label: 'set_label',
                            detail: 'set_label()',
                            docs: 'DOC?',
                            insert: 'set_label($1)'
                        },
                        {
                            label: 'get_label',
                            detail: 'get_label()',
                            docs: 'DOC?',
                            insert: 'get_label($1)'
                        },
                        {
                            label: 'get_child',
                            detail: 'get_child()',
                            docs: 'DOC?',
                            insert: 'get_child()'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...buttonGtk);
                }

                // Box
                if (getVarable(document, varName, 'Box')) {
                    const boxGtk = [
                        {
                            label: 'pack_start',
                            detail: 'pack_start(widget:Object, expand:Bool, fill:Bool, padding:int)',
                            docs: 'DOC?',
                            insert: 'pack_start($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...boxGtk);
                }

                // Entry
                if (getVarable(document, varName, 'Entry')) {
                    const entryGtk = [
                        {
                            label: 'set_placeholder_text',
                            detail: 'set_placeholder_text(str)',
                            docs: 'DOC?',
                            insert: 'set_placeholder_text("$1")'
                        },
                        {
                            label: 'set_visibility',
                            detail: 'set_visibility(bool)',
                            docs: 'DOC?',
                            insert: 'set_visibility($1)'
                        },
                        {
                            label: 'set_text',
                            detail: 'set_text({varable_text_name})',
                            docs: 'DOC?',
                            insert: 'set_text($1)'
                        },
                        {
                            label: 'get_text',
                            detail: 'get_text()',
                            docs: 'DOC?',
                            insert: 'get_text()'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...entryGtk);
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
                    results.push(...GtkAboutDialog, ...GtkContainer, ...GtkBin, ...GtkWindow, ...GtkDialog);
                }

                // bind_property
                if (getVarable(document, varName, 'bind_property')){
                    const bind_propertyMethod = [
                        
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                }

                // Object from Gobject Lib
                // if (linePrefix.match(/Object\.\w*$/)) {
                //     const ObjectFGObjectLib = [
                //         {
                //             label: '',
                //         }
                //     ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                //     results.push(...GObjectMethodInheartence)
                // }

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