
# NEXT UPDATE [0.0.3] ---------> !!!

# import gi
# gi.require_version("Gtk", "3.0")
# from gi.repository import Gtk, GdkPixbuf # -- (Add Autocomplete import for all Gtk)

# def show_about(button):
#     # إنشاء النافذة
#     about = Gtk.AboutDialog()
    
#     # تحديد المعلومات
#     about.set_program_name("Fluct Extension")
#     about.set_version("0.0.3")
#     about.set_authors(["Mohamed (fluct1)"])
#     about.set_copyright("Copyright © 2026")
#     about.set_comments("A professional GTK completion provider for VS Code.")
#     about.set_website("https://github.com/CatMilkTea-M/ac-gtk-python")
    
#     # NEXT UPDATE [0.0.4] ---------> !!!
#     # إضافة اللوجو (إذا كان لديك ملف صورة)
#     # pixbuf = GdkPixbuf.Pixbuf.new_from_file("logo.png")
#     # about.set_logo(pixbuf)
#     #------------------------------------------ !
#     # تشغيل النافذة وإغلاقها عند الضغط على Close
#     about.run()
#     about.destroy()

# # كود تشغيل بسيط
# win = Gtk.Window(title="hi")
# btn = Gtk.Button(label="about")
# btn.connect("clicked", show_about)
# win.add(btn)
# win.connect("destroy", Gtk.main_quit)
# win.show_all()
# Gtk.main()

# ------------------------- Testing Area -------------------------------------- |

# class MyAPP(Gtk.Window):
#     def __init__(self):
#         self.app_tit = "AC-GTK"

#         Gtk.Window.__init__(self, title=self.app_tit) # err404: __init__ and title= not suggest.

#         self.set_default_size(400, 300) # err: halighn is suggest in wrong place.

#         self.main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10) #warning: spacing is suggest in all spaces and with '.' or ','.
        
#         self.add(self.main_box)

#         #Test Later..
#         #self.user_entry = Gtk.Entry()
#         #self.user_entry
#         #-----------------------------

#         self.btn = Gtk.Button(label="About Me")
#         self.btn.connect("clicked", self.onpres)
#         self.main_box.pack_start(self.btn, True, True, 0)
#     def onpres(self, widget):
#         about = Gtk.AboutDialog()
#         about.set_program_name("AC-GTK Test")
#         about.set_version("0.0.3")
#         about.set_authors(["Fluct"])
#         about.set_comments("Testing Logic")
#         about.run()
#         about.destroy()

# if __name__ == "__main__":
#     win = MyAPP()
#     win.connect("destroy", Gtk.main_quit)
#     win.show_all()
#     Gtk.main()
    
#def test(button) works
#def test(self, widget) works
# def inputs in () is so bad fix it! and autocomplete is bad too because its works in anywhere.

# Test 0.0.5 ------->:
# import gi
# gi.require_version("Gtk", "3.0")
# from gi.repository import Gtk

# class mywin(Gtk.Window):
#     def __init__(self):
#         super().__init__(title="Hello World")
#         self.set_border_width(15) # --------------> Add Border auto!
#         self.set_default_size(250, 100)

#         vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=6)
#         print(dir(vbox.props))
#         self.add(vbox)

#         self.button = Gtk.Button(label="Click")
#         vbox.pack_start(self.button, True, True, 0)

#         self.handlur_od = self.button.connect("clicked", self.on_button_click)

#         self.dis_btn = Gtk.Button(label="Disable Button")
#         self.dis_btn.connect("clicked", self.on_dis_click)
#         vbox.pack_start(self.dis_btn, True, True, 0)

#     def on_button_click(self, widget):
#         print("Hello World")
    
#     def on_dis_click(self, widget):
#         if self.handlur_od:
#             self.button.disconnect(self.handlur_od) # Add disconnect method -----!
#             self.disconnect_by_func() # Add -----!
#             print("button disconnected")
#             self.dis_btn.set_label("button disabled") # Add set_label for Button -----!
#             self.dis_btn.set_sensitive(False)
#             label = Gtk.Label()
#             label.set_label("Hi") # Add for Label ----!
#             label.set_angle(25) # Add ----!
#             label.set_halign(Gtk.Align.END)

# win = mywin()
# win.connect("destroy", Gtk.main_quit)
# win.show_all()
# Gtk.main()
# # edit to set/get_text for Entry/Label and set/get_label for Button/Label

import gi
gi.require_version('Gtk', '3.0')
from gi.repository import GObject

# =======================================================
# 1. طبخ الجينات: بناء كائن ناتيف من الجد مباشرة
# =======================================================
class PandaCore(GObject.Object):
    
    # 🛠️ التعديل هنا: الخصائص بتتحط في كلاسك أنت مباشرة مش جوه GParamSpec
    __gproperties__ = {
        "system-status": (
            GObject.TYPE_STRING,          # نوع البيانات
            "Status",                     # الاسم المستعار
            "Current system status log",  # الوصف
            "Initialized",                # القيمة الافتراضية
            GObject.ParamFlags.READWRITE  # قراءة وكتابة
        )
    }

    def __init__(self):
        super().__init__()
        self._status = "Initialized"

    # 🎭 الـ Virtual Methods (دوال الجد المفرغة اللي مليناها)
    def do_get_property(self, pspec):
        if pspec.name == "system-status":
            return self._status
        return AttributeError

    def do_set_property(self, pspec, value):
        if pspec.name == "system-status":
            if self._status != value:
                self._status = value
                # 📡 إطلاق إشارة التنبيه الناتيفة عند التغيير
                self.notify("system-status")

# =======================================================
# 2. تشغيل النظام: استخدام الخصائص المورثة لايف
# =======================================================

print("--- 🐼 معمل فحص الجد الأعظم GObject الشغال بنجاح ---")

# خلق الكائنات في الرام
engine_source = PandaCore()
engine_target = PandaCore()

# 📡 القوة 1: الـ connect (ربط الإشارات المورثة)
def on_status_changed(obj, pspec):
    print(f"🚨 [إشارة ناتيفة]: الخاصية '{pspec.name}' اتغيرت وبقت -> {obj.get_property(pspec.name)}")

engine_source.connect("notify::system-status", on_status_changed)

# 🧬 القوة 2: الـ bind_property (الربط التلقائي)
engine_source.bind_property(
    "system-status", 
    engine_target, 
    "system-status", 
    GObject.BindingFlags.DEFAULT
)

# 🔥 تجربة التغيير لايف
print("\n[تعديل الكائن الأول بـ set_property]...")
engine_source.set_property("system-status", "Running 1.0.7 🔥🚀")

# 🔍 فحص النتيجة في الكائن الثاني
print(f"\n[فحص الكائن الثاني بـ get_property]: {engine_target.get_property('system-status')}")

# 🛠️ استخدام Class Methods للفحص
print("\n--- 🔍 فحص أدوات المصنع (Class Methods) ---")
pspec = PandaCore.find_property("system-status")
print(f"• فحص find_property: الاسم الحقيقي هو '{pspec.name}'")

print("\n• قائمة الخصائص المتاحة للجد بالكامل:")
for prop in engine_source.list_properties():
    print(f"  - {prop.name}")