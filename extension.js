
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
                        insert: 'Entry($1)'
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
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Class));
            }

            // import suggests
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

            if (linePrefix.match(/self\.\w*$/)) {
                return [
                    {
                        label: 'set_default_size',
                        detail: 'self.set_default_size(width, height)',
                        docs: 'To control the window size.',
                        insert: 'set_default_size($1)'
                    },
					{
						label: 'add',
						detail: 'self.add(element)',
						docs: 'DOC?',
						insert: 'add($1)'
					},
                    {
                        label: 'show_all',
                        detail: 'show_all()',
                        docs: 'DOC?',
                        insert: 'show_all()'
                    },
                    {
                        label: 'set_position',
                        detail: 'set_position()',
                        docs: 'DOC?',
                        insert: 'set_position($1)'
                    },
                    {
                        label: 'set_border_width',
                        detail: 'set_border_width()',
                        docs: 'DOC?',
                        insert: 'set_border_width($1)'
                    },
                    {
                        label: 'set_icon',
                        detail: 'set_icon()',
                        docs: 'DOC?',
                        insert: 'set_icon($1)'
                    },
                    {
                        label: 'set_icon_name',
                        detail: 'set_icon_name("")',
                        docs: 'DOC?',
                        insert: 'set_icon_name("$1")'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Method));
            }

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
                            label: 'props',
                            detail: 'props.propertie_name',
                            docs: 'DOC?',
                            insert: 'props'
                        },
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
                            label: 'set_property',
                            detail: 'set_property("{{prop_name}", prop_new_status)',
                            docs: 'DOC?',
                            insert: 'set_property($1)'
                        },
                        {
                            label: 'get_property',
                            detail: 'get_property("{prop_name}")',
                            docs: 'DOC?',
                            insert: 'get_property($1)'
                        },
                        {
                            label: 'connect',
                            detail: 'Widget.connect()',
                            docs: 'DOC?',
                            insert: 'connect($1)'
                        },
                        {
                            label: 'disconnect',
                            detail: 'Widget.disconnect()',
                            docs: 'DOC?',
                            insert: 'disconnect($1)'
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
                    results.push(...commonGtkMethods);
                }

                // Label
                if (getVarable(document, varName, 'Label')) {
                    const labelGtk = [
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
                        },
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
                            label: 'set_angle',
                            detail: 'set_angle()',
                            docs: 'DOC?',
                            insert: 'set_angle($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...labelGtk);
                }

                // Window
                if (getVarable(document, varName, 'Window')) {
                    const windowGtk = [
                        {
                            label: 'show_all',
                            detail: 'Gtk.Window.show_all() or your class or varable.',
                            docs: 'DOC?',
                            insert: 'show_all()'
                        },
                        {
                            label: 'add',
                            detail: 'Gtk.Window().add()',
                            docs: 'DOC?',
                            insert: 'add($1)'
                        },
                        {
                        label: 'set_default_size',
                        detail: 'self.set_default_size(width, height)',
                        docs: 'To control the window size.',
                        insert: 'set_default_size($1)'
                        },
                        {
                            label: 'set_position',
                            detail: 'set_position()',
                            docs: 'DOC?',
                            insert: 'set_position($1)'
                        },
                        {
                            label: 'set_border_width',
                            detail: 'set_border_width()',
                            docs: 'DOC?',
                            insert: 'set_border_width($1)'
                        },
                        {
                            label: 'set_icon',
                            detail: 'set_icon()',
                            docs: 'DOC?',
                            insert: 'set_icon($1)'
                        },
                        {
                            label: 'set_icon_name',
                            detail: 'set_icon_name("")',
                            docs: 'DOC?',
                            insert: 'set_icon_name("$1")'
                        },
                        {
                            label: 'get_child',
                            detail: 'get_child()',
                            docs: 'DOC?',
                            insert: 'get_child()'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...windowGtk);
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
                    const aboutDialogGtk = [
                        {
                            label: 'set_program_name',
                            detail: 'AC-GTK',
                            docs: 'DOC?',
                            insert: 'set_program_name("$1")'
                        },
                        {
                            label: 'set_version',
                            detail: 'AC-GTK',
                            docs: 'DOC?',
                            insert: 'set_version("$1")'
                        },
                        {
                            label: 'set_authors',
                            detail: 'AC-GTK',
                            docs: 'DOC?',
                            insert: 'set_authors(["$1"])'
                        },
                        {
                            label: 'set_copyright',
                            detail: 'AC-GTK',
                            docs: 'DOC?',
                            insert: 'set_copyright("$1")'
                        },
                        {
                            label: 'set_comments',
                            detail: 'AC-GTK',
                            docs: 'DOC?',
                            insert: 'set_comments("$1")'
                        },
                        {
                            label: 'run',
                            detail: 'AC-GTK',
                            docs: 'DOC?',
                            insert: 'run()'
                        },
                        {
                            label: 'destroy',
                            detail: 'AC-GTK',
                            docs: 'DOC?',
                            insert: 'destroy()'
                        },
                        {
                            label: 'set_logo',
                            detail: 'set_logo()',
                            docs: 'DOC?',
                            insert: 'set_logo($1)'
                        },
                        {
                            label: 'set_documenters',
                            detail: 'set_documenters()',
                            docs: 'DOC?',
                            insert: 'set_documenters(["$1"])'
                        },
                        {
                            label: 'set_website',
                            detail: 'set_website()',
                            docs: 'DOC?',
                            insert: 'set_website("$1")'
                        },
                        {
                            label: 'set_website_label',
                            detail: 'set_website_label()',
                            docs: 'DOC?',
                            insert: 'set_website_label("$1")'
                        },
                        {
                            label: 'set_transient_for',
                            detail: 'set_transient_for()',
                            docs: 'DOC?',
                            insert: 'set_transient_for($1)'
                        },
                        {
                            label: 'set_modal',
                            detail: 'set_modal(bool)',
                            docs: 'DOC?',
                            insert: 'set_modal($1)'
                        }
                    ].map(s => createItem(s, vscode.CompletionItemKind.Method));
                    results.push(...aboutDialogGtk);
                }

                // All Suggests
                if (results.length > 0) {
                    return results;
                }
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
                            item.insertText = new vscode.SnippetString(`${relativePath}")$1`);
                        } else {
                            item.insertText = new vscode.SnippetString(`"${relativePath}")$1`);
                        }
                        return item;
                    });
                });
            }
            // -----
            
            // props for widgets
            const ctorMatch = linePrefix.match(/(Window|Button|Box|Label|Entry)\((?:[^,]*,\s{0,1})*(\w*)$/);

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
                ].map(s => createItem(s, vscode.CompletionItemKind.Property)))
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
                    }
                ].map(s => {
                    let item = createItem(s, vscode.CompletionItemKind.Enum);

                    if (linePrefix.endsWith('"')) {
                        item.insertText = new vscode.SnippetString(s.insert.substring(1, s.insert.length - 1));
                    }
                    
                    return item;
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

            if (linePrefix.match(/Window\([\w\s]*$/i)) {
                return [
                    {
                        label: 'title',
                        detail: 'Gtk.Window(title="")',
                        docs: 'DOC?',
                        insert: 'title="$1"'
                    }
                ].map(s => createItem(s, vscode.CompletionItemKind.Property));
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
//get varable and confirm it, for example 'Gtk.Window' to auto connect.
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

function deactivate() {}

module.exports = { activate, deactivate };