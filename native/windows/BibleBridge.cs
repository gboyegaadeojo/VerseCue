// Experimental host-local ProPresenter Bible PREPARATION adapter.
// Explicit new-copy save is opt-in. No trigger, clear, theme, Look or macro API.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Automation;

class BibleBridge {
    [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hWnd,out uint processId);
    [DllImport("user32.dll")] static extern short GetAsyncKeyState(int key);
    [DllImport("user32.dll")] static extern bool SetCursorPos(int x,int y);
    [DllImport("user32.dll")] static extern IntPtr WindowFromPoint(ScreenPoint point);
    [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
    [StructLayout(LayoutKind.Sequential)] struct ScreenPoint { public int x,y; }
    [DllImport("user32.dll",SetLastError=true)] static extern uint SendInput(uint count,Input[] inputs,int size);
    [StructLayout(LayoutKind.Sequential)] struct KeyInput { public ushort vk,scan;public uint flags,time;public UIntPtr extra; }
    [StructLayout(LayoutKind.Sequential)] struct MouseInput { public int x,y;public uint data,flags,time;public UIntPtr extra; }
    [StructLayout(LayoutKind.Explicit)] struct InputUnion { [FieldOffset(0)] public KeyInput key;[FieldOffset(0)] public MouseInput mouse; }
    [StructLayout(LayoutKind.Sequential)] struct Input { public uint type;public InputUnion data; }
    static Input Key(ushort vk,ushort scan,uint flags) { return new Input {type=1,data=new InputUnion {key=new KeyInput {vk=vk,scan=scan,flags=flags}}}; }
    static void InputKeys(Input[] keys) { Require(SendInput((uint)keys.Length,keys,Marshal.SizeOf(typeof(Input)))==keys.Length,"KEYBOARD_INPUT_BLOCKED"); }
    static void EnterReference() { InputKeys(new [] {Key(0x0D,0,0),Key(0x0D,0,2)}); }
    static void WaitValue(AutomationElement field,string expected) { var timer=Stopwatch.StartNew();while(timer.ElapsedMilliseconds<1500){if(Value(field)==expected)return;Thread.Sleep(25);}Require(false,"REFERENCE_INPUT_READBACK_MISMATCH"); }
    static void WaitReleasedModifiers() { var timer=Stopwatch.StartNew();while(timer.ElapsedMilliseconds<1500){if((GetAsyncKeyState(0x10)&0x8000)==0&&(GetAsyncKeyState(0x11)&0x8000)==0&&(GetAsyncKeyState(0x12)&0x8000)==0)return;Thread.Sleep(20);}Require(false,"RELEASE_MODIFIER_KEYS_BEFORE_PREPARATION"); }
    static readonly JavaScriptSerializer Json = new JavaScriptSerializer();
    static readonly Stopwatch Total = Stopwatch.StartNew();
    static readonly Dictionary<string,long> Timings = new Dictionary<string,long>();
    static void Stage(string name) { Timings[name]=Total.ElapsedMilliseconds;Console.Error.WriteLine(Json.Serialize(new {stage=name,elapsedMs=Total.ElapsedMilliseconds}));Console.Error.Flush(); }
    static string Canonical(string value) { var text=Regex.Replace((value??"").Trim().Replace('\u2013','-').Replace('\u2014','-'),@"\s+"," ");text=Regex.Replace(text,@"^Psalms\b","Psalm",RegexOptions.IgnoreCase);text=Regex.Replace(text,@"^Song of Solomon\b","Song of Songs",RegexOptions.IgnoreCase);text=Regex.Replace(text,@"^Revelations\b","Revelation",RegexOptions.IgnoreCase);return text.ToLowerInvariant(); }
    static readonly Dictionary<string,string> Translations = new Dictionary<string,string> {
        {"KJV","King James Version"}, {"ASV","American Standard Version"},
        {"NIV","New International Version"}, {"NKJV","New King James Version"},
        {"AMP","Amplified Bible"}, {"AMPC","Amplified Bible, Classic Edition"}, {"MSG","The Message"}
    };
    static void Require(bool condition, string code) { if (!condition) throw new InvalidOperationException(code); }
    static AutomationElement ById(AutomationElement root, string id) {
        return root.FindFirst(TreeScope.Descendants, new PropertyCondition(AutomationElement.AutomationIdProperty,id));
    }
    static string Value(AutomationElement field) {
        object value; Require(field.TryGetCurrentPattern(ValuePattern.Pattern,out value),"REFERENCE_NOT_EDITABLE");
        return ((ValuePattern)value).Current.Value;
    }
    static AutomationElement TranslationSelector(AutomationElement root) {
        var selectors=root.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.AutomationIdProperty,"loadedBibleSelectorSelf"));
        Require(selectors.Count==1,"MULTIPLE_OR_MISSING_TRANSLATION_SELECTORS");
        return selectors[0];
    }
    static string SelectedTranslation(AutomationElement selector) {
        var cache=new CacheRequest();cache.TreeScope=TreeScope.Element;cache.TreeFilter=Automation.RawViewCondition;cache.Add(AutomationElement.NameProperty);
        AutomationElementCollection texts;using(cache.Activate()){texts=selector.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Text));}
        var names=texts.Cast<AutomationElement>().Select(e=>e.Cached.Name).Where(n=>!String.IsNullOrWhiteSpace(n)).ToArray();
        Require(names.Length==1,"TRANSLATION_SELECTION_UNCERTAIN");return names[0];
    }
    static AutomationElement OpenBibleView(AutomationElement root,Process process) {
        var header=ById(root,"bibleViewerHeader");if(header!=null)return header;
        var button=ById(root,"MAIN_MENU_VIEW_BIBLES_title");
        Require(button!=null&&button.Current.IsEnabled&&!button.Current.IsOffscreen,"BIBLE_VIEW_CONTROL_UNAVAILABLE");
        Stage("open-bible-view");ClickVerifiedControl(button,process.Id);
        var timer=Stopwatch.StartNew();while(timer.ElapsedMilliseconds<2000){header=ById(root,"bibleViewerHeader");if(header!=null)return header;Thread.Sleep(50);}
        throw new InvalidOperationException("BIBLE_VIEW_NOT_VERIFIED");
    }
    static void SelectTranslation(AutomationElement root,Process process,AutomationElement selector,string expected) {
        if(SelectedTranslation(selector)==expected)return;
        Stage("open-installed-editions");ClickVerifiedControl(selector,process.Id);
        var timer=Stopwatch.StartNew();bool selected=false;
        while(timer.ElapsedMilliseconds<2000) {
            uint foreground;GetWindowThreadProcessId(GetForegroundWindow(),out foreground);Require(foreground==process.Id,"FOCUS_CHANGED_DURING_EDITION_SELECTION");
            var windows=AutomationElement.RootElement.FindAll(TreeScope.Children,new PropertyCondition(AutomationElement.ProcessIdProperty,process.Id));
            var matches=new List<AutomationElement>();
            foreach(AutomationElement window in windows) {
                // The installed-edition popup exposes visible text rather than
                // the MenuItem profile used by Save As. Match the exact edition
                // name, prefer its visible text leaf, and hit-test before input.
                var items=window.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.NameProperty,expected));
                var visible=items.Cast<AutomationElement>().Where(e=>e.Current.IsEnabled&&!e.Current.IsOffscreen).ToArray();
                var leaves=visible.Where(e=>e.Current.ControlType==ControlType.Text).ToArray();
                matches.AddRange(leaves.Length>0?leaves:visible);
            }
            Require(matches.Count<=1,"INSTALLED_EDITION_AMBIGUOUS");
            if(matches.Count==1){Stage("select-installed-edition");ClickVerifiedControl(matches[0],process.Id);selected=true;break;}
            Thread.Sleep(50);
        }
        if(!selected){uint foreground;GetWindowThreadProcessId(GetForegroundWindow(),out foreground);if(foreground==process.Id)InputKeys(new [] {Key(0x1B,0,0),Key(0x1B,0,2)});throw new InvalidOperationException("REQUESTED_EDITION_NOT_FOUND_OR_MENU_UNVERIFIED");}
        timer.Restart();while(timer.ElapsedMilliseconds<1500){if(SelectedTranslation(selector)==expected)return;Thread.Sleep(50);}
        throw new InvalidOperationException("EDITION_SELECTION_NOT_VERIFIED");
    }
    static void ClickVerifiedControl(AutomationElement element,int processId) {
        var bounds=element.Current.BoundingRectangle;Require(!bounds.IsEmpty&&bounds.Width>1&&bounds.Height>1&&!element.Current.IsOffscreen,"SAVE_CONTROL_BOUNDS_UNAVAILABLE");
        var point=new ScreenPoint {x=(int)(bounds.X+bounds.Width/2),y=(int)(bounds.Y+bounds.Height/2)};
        uint owner;GetWindowThreadProcessId(WindowFromPoint(point),out owner);Require(owner==processId,"SAVE_CONTROL_OCCLUDED");
        var hit=AutomationElement.FromPoint(new System.Windows.Point(point.x,point.y));var expected=element.GetRuntimeId();bool matches=false;
        for(int depth=0;hit!=null&&depth<15;depth++,hit=TreeWalker.RawViewWalker.GetParent(hit))if(hit.GetRuntimeId().SequenceEqual(expected)){matches=true;break;}
        Require(matches,"SAVE_CONTROL_HIT_TEST_MISMATCH");Require(SetCursorPos(point.x,point.y),"SAVE_CONTROL_POINTER_BLOCKED");
        GetWindowThreadProcessId(GetForegroundWindow(),out owner);Require(owner==processId,"FOCUS_CHANGED_BEFORE_SAVE_CLICK");
        var down=new Input {type=0,data=new InputUnion {mouse=new MouseInput {flags=2}}};var up=new Input {type=0,data=new InputUnion {mouse=new MouseInput {flags=4}}};InputKeys(new [] {down,up});
    }
    static void SaveBibleCopy(AutomationElement root,Process process,AutomationElement field,AutomationElement selector,string reference,string selected) {
        Require(Canonical(Value(field))==Canonical(reference)&&SelectedTranslation(selector)==selected,"PASSAGE_CHANGED_BEFORE_SAVE");
        uint foreground;GetWindowThreadProcessId(GetForegroundWindow(),out foreground);Require(foreground==process.Id,"FOCUS_CHANGED_BEFORE_SAVE");
        var button=ById(root,"SaveCopyDocumentButton");Require(button!=null&&button.Current.IsEnabled&&!button.Current.IsOffscreen,"SAVE_COPY_CONTROL_UNAVAILABLE");
        object invoke;
        // This split control opens its menu on pointer-down rather than Invoke.
        // Resolve and hit-test its current accessibility bounds; never use a
        // stored screen coordinate or a keyboard shortcut for an unknown view.
        Stage("open-save-copy-menu");ClickVerifiedControl(button,process.Id);
        var timer=Stopwatch.StartNew();
        while(timer.ElapsedMilliseconds<2000) {
            var windows=AutomationElement.RootElement.FindAll(TreeScope.Children,new PropertyCondition(AutomationElement.ProcessIdProperty,process.Id));
            var matches=new List<AutomationElement>();
            foreach(AutomationElement window in windows) {
                var items=window.FindAll(TreeScope.Descendants,new AndCondition(new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.MenuItem),new PropertyCondition(AutomationElement.NameProperty,"Save As Presentation")));
                matches.AddRange(items.Cast<AutomationElement>().Where(e=>e.Current.IsEnabled&&!e.Current.IsOffscreen));
            }
            Require(matches.Count<=1,"SAVE_COPY_MENU_AMBIGUOUS");
            if(matches.Count==1) {
                GetWindowThreadProcessId(GetForegroundWindow(),out foreground);Require(foreground==process.Id,"FOCUS_CHANGED_IN_SAVE_MENU");
                Require(Canonical(Value(field))==Canonical(reference)&&SelectedTranslation(selector)==selected,"PASSAGE_CHANGED_IN_SAVE_MENU");
                Require(matches[0].TryGetCurrentPattern(InvokePattern.Pattern,out invoke),"SAVE_COPY_MENU_NOT_INVOKABLE");
                Stage("save-new-presentation-copy");((InvokePattern)invoke).Invoke();return;
            }
            Thread.Sleep(50);
        }
        throw new InvalidOperationException("SAVE_COPY_MENU_NOT_VERIFIED");
    }
    static object Run(Dictionary<string,object> request) {
        Stage("validate-target");
        string operation=Convert.ToString(request.ContainsKey("operation")?request["operation"]:"inspect");
        Require(operation=="inspect"||operation=="prepare"||operation=="prepare-save","UNKNOWN_OPERATION");
        string reference=null,translation=null;
        if(operation!="inspect") {
            Require(request.Count==3&&request.ContainsKey("reference")&&request.ContainsKey("translation"),"INVALID_PREPARE_REQUEST");
            reference=Convert.ToString(request["reference"]);translation=Convert.ToString(request["translation"]);
            Require(reference.Length<=100&&Regex.IsMatch(reference,@"^[1-3]?[A-Za-z ]+ [1-9][0-9]{0,2}:[1-9][0-9]{0,2}(-([1-9][0-9]{0,2}:)?[1-9][0-9]{0,2})?$"),"INVALID_REFERENCE_SHAPE");
            Require(Translations.ContainsKey(translation),"UNSUPPORTED_REQUESTED_TRANSLATION");
        }
        var processes=Process.GetProcessesByName("ProPresenter");Require(processes.Length==1,"ONE_PROPRESENTER_INSTANCE_REQUIRED");
        var process=processes[0];var expected=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),"Renewed Vision","ProPresenter","ProPresenter.exe");
        Require(String.Equals(Path.GetFullPath(process.MainModule.FileName),Path.GetFullPath(expected),StringComparison.OrdinalIgnoreCase),"UNEXPECTED_PROPRESENTER_EXECUTABLE");
        Require(process.MainWindowHandle!=IntPtr.Zero,"PROPRESENTER_WINDOW_UNAVAILABLE");
        var root=AutomationElement.FromHandle(process.MainWindowHandle);Require(root.Current.IsEnabled&&!root.Current.IsOffscreen,"PROPRESENTER_NOT_READY");
        // Inspection remains read-only. Preparation has explicit application
        // consent for focus changes, opening Bibles and exact edition selection.
        if(operation!="inspect"){Require(SetForegroundWindow(process.MainWindowHandle),"COULD_NOT_FOCUS_PROPRESENTER");WaitReleasedModifiers();}
        Stage("find-bible-controls");
        var header=operation=="inspect"?ById(root,"bibleViewerHeader"):OpenBibleView(root,process);Require(header!=null,"OPEN_BIBLES_VIEW_IN_PROPRESENTER");
        // Restrict control discovery to the observed Bible viewer, rather than
        // traversing unrelated library, media, stage and production controls.
        var bibleControls=TreeWalker.RawViewWalker.GetParent(header);Require(bibleControls!=null,"BIBLE_VIEW_CONTAINER_MISSING");
        var container=ById(header,"ReferenceTextBox");Require(container!=null,"REFERENCE_CONTAINER_MISSING");
        var edits=container.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Edit));
        Require(edits.Count==1,"REFERENCE_INPUT_AMBIGUOUS");var field=edits[0];
        Require(field.Current.IsEnabled&&!field.Current.IsOffscreen,"REFERENCE_INPUT_NOT_READY");
        var selector=TranslationSelector(bibleControls);string selected=SelectedTranslation(selector);
        if(operation=="inspect")return new {ok=true,state="inspection-only",translationDisplayName=selected,reference=Value(field),outputRequests=0};
        SelectTranslation(root,process,selector,Translations[translation]);selected=SelectedTranslation(selector);
        Require(Translations[translation]==selected,"REQUESTED_EDITION_NOT_VERIFIED");
        Stage("focus-reference");
        Require(SetForegroundWindow(process.MainWindowHandle),"COULD_NOT_FOCUS_PROPRESENTER");
        field.SetFocus();Require(GetForegroundWindow()==process.MainWindowHandle&&field.Current.HasKeyboardFocus,"REFERENCE_FOCUS_NOT_CONFIRMED");
        WaitReleasedModifiers();Require(GetForegroundWindow()==process.MainWindowHandle&&field.Current.HasKeyboardFocus,"FOCUS_CHANGED_DURING_PREPARATION");
        // Update the one validated Bible-reference control atomically. Per-key
        // Unicode input can interact with WPF's reference completion/caret logic.
        object editable;Require(field.TryGetCurrentPattern(ValuePattern.Pattern,out editable),"REFERENCE_NOT_EDITABLE");
        ((ValuePattern)editable).SetValue(reference);WaitValue(field,reference);
        Require(GetForegroundWindow()==process.MainWindowHandle&&field.Current.HasKeyboardFocus,"FOCUS_CHANGED_BEFORE_ENTER");
        Stage("commit-reference");EnterReference();
        // The control view can skip WPF layout containers and return the whole
        // window. Keep the immediate raw parent so verification stays scoped to
        // the Bible viewer, not media bins and every other production control.
        var bible=TreeWalker.RawViewWalker.GetParent(header);Require(bible!=null,"BIBLE_VIEW_CONTAINER_MISSING");
        Stage("verify-generated-labels");
        var watch=Stopwatch.StartNew();int stable=0,count=0;bool clipped=false;
        while(watch.ElapsedMilliseconds<5000) {
            Stage("verify-translation");
            Require(SelectedTranslation(selector)==selected,"TRANSLATION_CHANGED_DURING_PREPARATION");
            // Query only citation text during readiness polling. Enumerating
            // every layout/image node made a provider snapshot block long enough
            // to consume the bounded worker deadline on newly generated slides.
            AutomationElementCollection elements;
            var cache=new CacheRequest();cache.TreeScope=TreeScope.Element;cache.TreeFilter=Automation.RawViewCondition;
            cache.Add(AutomationElement.NameProperty);
            Stage("read-generated-snapshot");
            using(cache.Activate()) { elements=bible.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Text)); }
            var labels=elements.Cast<AutomationElement>().Select(e=>e.Cached.Name).ToArray();
            string expectedReference=Canonical(reference);
            bool rangeFound=labels.Any(n=>Canonical(n)==expectedReference||Canonical(n).StartsWith(expectedReference+" ",StringComparison.OrdinalIgnoreCase));count=labels.Count(n=>Regex.IsMatch(n??"",@"^[1-3]?[A-Za-z ]+ [1-9][0-9]*:[1-9][0-9]*"));
            bool fieldMatches=Canonical(Value(field))==expectedReference;
            Console.Error.WriteLine(Json.Serialize(new {stage="verify-check",elapsedMs=Total.ElapsedMilliseconds,fieldMatches=fieldMatches,rangeFound=rangeFound,elementCount=elements.Count,labelCount=count}));Console.Error.Flush();
            stable=fieldMatches&&rangeFound&&count>0?stable+1:0;
            if(stable>=2) {
                var warningCache=new CacheRequest();warningCache.TreeScope=TreeScope.Element;warningCache.Add(AutomationElement.NameProperty);warningCache.Add(AutomationElement.HelpTextProperty);
                AutomationElementCollection warnings;using(warningCache.Activate()){warnings=bible.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Image));}
                clipped=warnings.Cast<AutomationElement>().Any(e=>(e.Cached.HelpText??"").IndexOf("clipped",StringComparison.OrdinalIgnoreCase)>=0||(e.Cached.Name??"").IndexOf("clipped",StringComparison.OrdinalIgnoreCase)>=0);
                Stage("prepared-review");
                bool saveCopy=operation=="prepare-save";
                if(saveCopy)SaveBibleCopy(bible,process,field,selector,reference,selected);
                return new {ok=true,state="prepared-needs-operator-review",reference=reference,translation=translation,referenceLabels=count,clippingWarning=clipped,saveCopyRequested=saveCopy,formattingVerified=false,outputRequests=0,outputObserved=false,elapsedMs=Total.ElapsedMilliseconds,timingsMs=Timings};
            }
            Thread.Sleep(150);
        }
        throw new InvalidOperationException("PREPARATION_COMPLETION_NOT_VERIFIED");
    }
    [MTAThread] static int Main() {
        try {
            SetProcessDPIAware();
            string input=Console.ReadLine();Require(input!=null&&input.Length<=8192,"INVALID_REQUEST_SIZE");
            var request=Json.Deserialize<Dictionary<string,object>>(input);Require(request!=null,"INVALID_REQUEST");
            Console.WriteLine(Json.Serialize(Run(request)));return 0;
        }catch(InvalidOperationException e){Console.WriteLine(Json.Serialize(new {ok=false,code=e.Message,outputRequests=0}));return 2;}
        catch{Console.WriteLine(Json.Serialize(new {ok=false,code="NATIVE_UI_ACCESS_UNCERTAIN",outputRequests=0}));return 3;}
    }
}
