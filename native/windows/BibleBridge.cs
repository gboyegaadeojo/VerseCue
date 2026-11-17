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
using System.Windows.Forms;

class BibleBridge {
    [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    static readonly JavaScriptSerializer Json = new JavaScriptSerializer();
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
    static string SelectedTranslation(AutomationElement root) {
        var selectors=root.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.AutomationIdProperty,"loadedBibleSelectorSelf"));
        Require(selectors.Count==1,"MULTIPLE_OR_MISSING_TRANSLATION_SELECTORS");
        var texts=selectors[0].FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Text));
        var names=texts.Cast<AutomationElement>().Select(e=>e.Current.Name).Where(n=>!String.IsNullOrWhiteSpace(n)).ToArray();
        Require(names.Length==1,"TRANSLATION_SELECTION_UNCERTAIN");return names[0];
    }
    static object Run(Dictionary<string,object> request) {
        string operation=Convert.ToString(request.ContainsKey("operation")?request["operation"]:"inspect");
        Require(operation=="inspect"||operation=="prepare","UNKNOWN_OPERATION");
        var processes=Process.GetProcessesByName("ProPresenter");Require(processes.Length==1,"ONE_PROPRESENTER_INSTANCE_REQUIRED");
        var process=processes[0];var expected=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),"Renewed Vision","ProPresenter","ProPresenter.exe");
        Require(String.Equals(Path.GetFullPath(process.MainModule.FileName),Path.GetFullPath(expected),StringComparison.OrdinalIgnoreCase),"UNEXPECTED_PROPRESENTER_EXECUTABLE");
        Require(process.MainWindowHandle!=IntPtr.Zero,"PROPRESENTER_WINDOW_UNAVAILABLE");
        var root=AutomationElement.FromHandle(process.MainWindowHandle);Require(root.Current.IsEnabled&&!root.Current.IsOffscreen,"PROPRESENTER_NOT_READY");
        var header=ById(root,"bibleViewerHeader");Require(header!=null,"OPEN_BIBLES_VIEW_IN_PROPRESENTER");
        var container=ById(header,"ReferenceTextBox");Require(container!=null,"REFERENCE_CONTAINER_MISSING");
        var edits=container.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Edit));
        Require(edits.Count==1,"REFERENCE_INPUT_AMBIGUOUS");var field=edits[0];
        Require(field.Current.IsEnabled&&!field.Current.IsOffscreen,"REFERENCE_INPUT_NOT_READY");
        string selected=SelectedTranslation(root);
        if(operation=="inspect")return new {ok=true,state="inspection-only",translationDisplayName=selected,reference=Value(field),outputRequests=0};
        Require(request.Count==3&&request.ContainsKey("reference")&&request.ContainsKey("translation"),"INVALID_PREPARE_REQUEST");
        string reference=Convert.ToString(request["reference"]),translation=Convert.ToString(request["translation"]);
        Require(reference.Length<=100&&Regex.IsMatch(reference,@"^[1-3]?[A-Za-z ]+ [1-9][0-9]{0,2}:[1-9][0-9]{0,2}(-([1-9][0-9]{0,2}:)?[1-9][0-9]{0,2})?$"),"INVALID_REFERENCE_SHAPE");
        Require(Translations.ContainsKey(translation)&&Translations[translation]==selected,"SELECT_REQUESTED_TRANSLATION_MANUALLY");
        Require(SetForegroundWindow(process.MainWindowHandle),"COULD_NOT_FOCUS_PROPRESENTER");
        field.SetFocus();Require(GetForegroundWindow()==process.MainWindowHandle&&field.Current.HasKeyboardFocus,"REFERENCE_FOCUS_NOT_CONFIRMED");
        SendKeys.SendWait("^a");Require(GetForegroundWindow()==process.MainWindowHandle&&field.Current.HasKeyboardFocus,"FOCUS_CHANGED_DURING_PREPARATION");
        // The strict alphabet/digit/colon/hyphen reference whitelist above excludes
        // every SendKeys command metacharacter. No arbitrary keyboard API exists.
        SendKeys.SendWait(reference);Require(Value(field)==reference,"REFERENCE_INPUT_READBACK_MISMATCH");
        Require(GetForegroundWindow()==process.MainWindowHandle&&field.Current.HasKeyboardFocus,"FOCUS_CHANGED_BEFORE_ENTER");
        SendKeys.SendWait("{ENTER}");
        var bible=TreeWalker.ControlViewWalker.GetParent(header);Require(bible!=null,"BIBLE_VIEW_CONTAINER_MISSING");
        var watch=Stopwatch.StartNew();int stable=0,count=0;bool clipped=false;
        while(watch.ElapsedMilliseconds<5000) {
            Require(SelectedTranslation(root)==selected,"TRANSLATION_CHANGED_DURING_PREPARATION");
            var text=bible.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Text));
            var labels=text.Cast<AutomationElement>().Select(e=>e.Current.Name).ToArray();
            bool rangeFound=labels.Any(n=>n==reference);count=labels.Count(n=>Regex.IsMatch(n??"",@"^[1-3]?[A-Za-z ]+ [1-9][0-9]*:[1-9][0-9]*"));
            stable=Value(field)==reference&&rangeFound&&count>0?stable+1:0;
            if(stable>=2) {
                var all=bible.FindAll(TreeScope.Descendants,Condition.TrueCondition);
                clipped=all.Cast<AutomationElement>().Any(e=>(e.Current.HelpText??"").IndexOf("clipped",StringComparison.OrdinalIgnoreCase)>=0||(e.Current.Name??"").IndexOf("clipped",StringComparison.OrdinalIgnoreCase)>=0);
                return new {ok=true,state="prepared-needs-operator-review",reference=reference,translation=translation,referenceLabels=count,clippingWarning=clipped,formattingVerified=false,outputRequests=0,outputObserved=false};
            }
            Thread.Sleep(150);
        }
        throw new InvalidOperationException("PREPARATION_COMPLETION_NOT_VERIFIED");
    }
    [STAThread] static int Main() {
        try {
            string input=Console.ReadLine();Require(input!=null&&input.Length<=8192,"INVALID_REQUEST_SIZE");
            var request=Json.Deserialize<Dictionary<string,object>>(input);Require(request!=null,"INVALID_REQUEST");
            Console.WriteLine(Json.Serialize(Run(request)));return 0;
        }catch(InvalidOperationException e){Console.WriteLine(Json.Serialize(new {ok=false,code=e.Message,outputRequests=0}));return 2;}
        catch{Console.WriteLine(Json.Serialize(new {ok=false,code="NATIVE_UI_ACCESS_UNCERTAIN",outputRequests=0}));return 3;}
    }
}
