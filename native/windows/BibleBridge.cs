// Experimental host-local ProPresenter Bible PREPARATION adapter.
// No presentation trigger, clear, theme, Look, macro or library mutation API.
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
    [DllImport("user32.dll",SetLastError=true)] static extern uint SendInput(uint count,Input[] inputs,int size);
    [StructLayout(LayoutKind.Sequential)] struct KeyInput { public ushort vk,scan;public uint flags,time;public UIntPtr extra; }
    [StructLayout(LayoutKind.Sequential)] struct MouseInput { public int x,y;public uint data,flags,time;public UIntPtr extra; }
    [StructLayout(LayoutKind.Explicit)] struct InputUnion { [FieldOffset(0)] public KeyInput key;[FieldOffset(0)] public MouseInput mouse; }
    [StructLayout(LayoutKind.Sequential)] struct Input { public uint type;public InputUnion data; }
    static Input Key(ushort vk,ushort scan,uint flags) { return new Input {type=1,data=new InputUnion {key=new KeyInput {vk=vk,scan=scan,flags=flags}}}; }
    static void InputKeys(Input[] keys) { Require(SendInput((uint)keys.Length,keys,Marshal.SizeOf(typeof(Input)))==keys.Length,"KEYBOARD_INPUT_BLOCKED"); }
    static void SelectAll() { InputKeys(new [] {Key(0x11,0,0),Key(0x41,0,0),Key(0x41,0,2),Key(0x11,0,2)}); }
    static void TypeReference(string reference) { var keys=new List<Input>();foreach(char c in reference){keys.Add(Key(0,c,4));keys.Add(Key(0,c,6));}InputKeys(keys.ToArray()); }
    static void EnterReference() { InputKeys(new [] {Key(0x0D,0,0),Key(0x0D,0,2)}); }
    static void WaitValue(AutomationElement field,string expected) { var timer=Stopwatch.StartNew();while(timer.ElapsedMilliseconds<750){if(Value(field)==expected)return;Thread.Sleep(25);}Require(false,"REFERENCE_INPUT_READBACK_MISMATCH"); }
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
        var texts=selector.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Text));
        var names=texts.Cast<AutomationElement>().Select(e=>e.Current.Name).Where(n=>!String.IsNullOrWhiteSpace(n)).ToArray();
        Require(names.Length==1,"TRANSLATION_SELECTION_UNCERTAIN");return names[0];
    }
    static object Run(Dictionary<string,object> request) {
        Stage("validate-target");
        string operation=Convert.ToString(request.ContainsKey("operation")?request["operation"]:"inspect");
        Require(operation=="inspect"||operation=="prepare","UNKNOWN_OPERATION");
        var processes=Process.GetProcessesByName("ProPresenter");Require(processes.Length==1,"ONE_PROPRESENTER_INSTANCE_REQUIRED");
        var process=processes[0];var expected=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),"Renewed Vision","ProPresenter","ProPresenter.exe");
        Require(String.Equals(Path.GetFullPath(process.MainModule.FileName),Path.GetFullPath(expected),StringComparison.OrdinalIgnoreCase),"UNEXPECTED_PROPRESENTER_EXECUTABLE");
        Require(process.MainWindowHandle!=IntPtr.Zero,"PROPRESENTER_WINDOW_UNAVAILABLE");
        var root=AutomationElement.FromHandle(process.MainWindowHandle);Require(root.Current.IsEnabled&&!root.Current.IsOffscreen,"PROPRESENTER_NOT_READY");
        Stage("find-bible-controls");
        var header=ById(root,"bibleViewerHeader");Require(header!=null,"OPEN_BIBLES_VIEW_IN_PROPRESENTER");
        var container=ById(header,"ReferenceTextBox");Require(container!=null,"REFERENCE_CONTAINER_MISSING");
        var edits=container.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Edit));
        Require(edits.Count==1,"REFERENCE_INPUT_AMBIGUOUS");var field=edits[0];
        Require(field.Current.IsEnabled&&!field.Current.IsOffscreen,"REFERENCE_INPUT_NOT_READY");
        var selector=TranslationSelector(root);string selected=SelectedTranslation(selector);
        if(operation=="inspect")return new {ok=true,state="inspection-only",translationDisplayName=selected,reference=Value(field),outputRequests=0};
        Require(request.Count==3&&request.ContainsKey("reference")&&request.ContainsKey("translation"),"INVALID_PREPARE_REQUEST");
        string reference=Convert.ToString(request["reference"]),translation=Convert.ToString(request["translation"]);
        Require(reference.Length<=100&&Regex.IsMatch(reference,@"^[1-3]?[A-Za-z ]+ [1-9][0-9]{0,2}:[1-9][0-9]{0,2}(-([1-9][0-9]{0,2}:)?[1-9][0-9]{0,2})?$"),"INVALID_REFERENCE_SHAPE");
        Require(Translations.ContainsKey(translation)&&Translations[translation]==selected,"SELECT_REQUESTED_TRANSLATION_MANUALLY");
        Stage("focus-reference");
        Require(SetForegroundWindow(process.MainWindowHandle),"COULD_NOT_FOCUS_PROPRESENTER");
        field.SetFocus();Require(GetForegroundWindow()==process.MainWindowHandle&&field.Current.HasKeyboardFocus,"REFERENCE_FOCUS_NOT_CONFIRMED");
        SelectAll();Require(GetForegroundWindow()==process.MainWindowHandle&&field.Current.HasKeyboardFocus,"FOCUS_CHANGED_DURING_PREPARATION");
        // The strict alphabet/digit/colon/hyphen reference whitelist above excludes
        // every SendKeys command metacharacter. No arbitrary keyboard API exists.
        TypeReference(reference);WaitValue(field,reference);
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
            // Cache properties once per provider snapshot. Reading Current.Name
            // individually on hundreds of elements incurs cross-process calls.
            AutomationElementCollection elements;
            var cache=new CacheRequest();cache.TreeScope=TreeScope.Element;cache.TreeFilter=Automation.RawViewCondition;
            cache.Add(AutomationElement.NameProperty);cache.Add(AutomationElement.HelpTextProperty);cache.Add(AutomationElement.ControlTypeProperty);
            Stage("read-generated-snapshot");
            using(cache.Activate()) { elements=bible.FindAll(TreeScope.Descendants,Condition.TrueCondition); }
            var labels=elements.Cast<AutomationElement>().Where(e=>e.Cached.ControlType==ControlType.Text).Select(e=>e.Cached.Name).ToArray();
            string expectedReference=Canonical(reference);
            bool rangeFound=labels.Any(n=>Canonical(n)==expectedReference||Canonical(n).StartsWith(expectedReference+" ",StringComparison.OrdinalIgnoreCase));count=labels.Count(n=>Regex.IsMatch(n??"",@"^[1-3]?[A-Za-z ]+ [1-9][0-9]*:[1-9][0-9]*"));
            bool fieldMatches=Canonical(Value(field))==expectedReference;
            Console.Error.WriteLine(Json.Serialize(new {stage="verify-check",elapsedMs=Total.ElapsedMilliseconds,fieldMatches=fieldMatches,rangeFound=rangeFound,elementCount=elements.Count,labelCount=count}));Console.Error.Flush();
            stable=fieldMatches&&rangeFound&&count>0?stable+1:0;
            if(stable>=2) {
                clipped=elements.Cast<AutomationElement>().Any(e=>(e.Cached.HelpText??"").IndexOf("clipped",StringComparison.OrdinalIgnoreCase)>=0||(e.Cached.Name??"").IndexOf("clipped",StringComparison.OrdinalIgnoreCase)>=0);
                Stage("prepared-review");
                return new {ok=true,state="prepared-needs-operator-review",reference=reference,translation=translation,referenceLabels=count,clippingWarning=clipped,formattingVerified=false,outputRequests=0,outputObserved=false,elapsedMs=Total.ElapsedMilliseconds,timingsMs=Timings};
            }
            Thread.Sleep(150);
        }
        throw new InvalidOperationException("PREPARATION_COMPLETION_NOT_VERIFIED");
    }
    [MTAThread] static int Main() {
        try {
            string input=Console.ReadLine();Require(input!=null&&input.Length<=8192,"INVALID_REQUEST_SIZE");
            var request=Json.Deserialize<Dictionary<string,object>>(input);Require(request!=null,"INVALID_REQUEST");
            Console.WriteLine(Json.Serialize(Run(request)));return 0;
        }catch(InvalidOperationException e){Console.WriteLine(Json.Serialize(new {ok=false,code=e.Message,outputRequests=0}));return 2;}
        catch{Console.WriteLine(Json.Serialize(new {ok=false,code="NATIVE_UI_ACCESS_UNCERTAIN",outputRequests=0}));return 3;}
    }
}
