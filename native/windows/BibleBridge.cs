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
    [DllImport("user32.dll")] static extern bool GetCursorPos(out ScreenPoint point);
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
        {"AMP","Amplified Bible"}, {"AMPC","Amplified Bible, Classic Edition"}, {"MSG","The Message"},
        {"ESV","English Standard Version"}, {"NLT","New Living Translation"}
    };
    static void Require(bool condition, string code) { if (!condition) throw new InvalidOperationException(code); }
    static AutomationElement ById(AutomationElement root, string id) {
        return root.FindFirst(TreeScope.Descendants, new PropertyCondition(AutomationElement.AutomationIdProperty,id));
    }
    // Version tolerance (NR-017): use the exact ID verified on ProPresenter 21.4.2; if a different ProPresenter
    // version renamed it, accept exactly one control whose ID contains the same key word. None or several: stop safely.
    static AutomationElement ByIdOrKeyword(AutomationElement root,string id,string keyword) {
        var exact=ById(root,id);if(exact!=null)return exact;
        var matches=new List<AutomationElement>();var walker=TreeWalker.ControlViewWalker;var stack=new Stack<AutomationElement>();stack.Push(root);int seen=0;var budget=Stopwatch.StartNew();
        while(stack.Count>0&&seen<8000&&budget.ElapsedMilliseconds<1500){var el=stack.Pop();seen++;string aid;try{aid=el.Current.AutomationId??"";}catch(ElementNotAvailableException){continue;}
            if(aid.IndexOf(keyword,StringComparison.OrdinalIgnoreCase)>=0){matches.Add(el);if(matches.Count>1)return null;}
            for(var child=walker.GetFirstChild(el);child!=null;child=walker.GetNextSibling(child))stack.Push(child);}
        return matches.Count==1?matches[0]:null;
    }
    static string Value(AutomationElement field) {
        // Fetch a new read-only snapshot on every call; never reuse a prior value.
        var request=new CacheRequest();request.TreeScope=TreeScope.Element;request.TreeFilter=Automation.RawViewCondition;request.AutomationElementMode=AutomationElementMode.None;
        request.Add(ValuePattern.Pattern);request.Add(ValuePattern.ValueProperty);
        var snapshot=field.GetUpdatedCache(request);
        object value;Require(snapshot.TryGetCachedPattern(ValuePattern.Pattern,out value),"REFERENCE_NOT_EDITABLE");
        return ((ValuePattern)value).Cached.Value;
    }
    static AutomationElement TranslationSelector(AutomationElement root) {
        // Narrow first (docs/153): the edition control sits in the Bible viewer's translation pane (a direct ScrollViewer
        // child), away from the slides. Several selectors (side-by-side editions) still stop safely.
        var narrow=new List<AutomationElement>();
        foreach(AutomationElement pane in root.FindAll(TreeScope.Children,new PropertyCondition(AutomationElement.ClassNameProperty,"ScrollViewer")))
            narrow.AddRange(pane.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.AutomationIdProperty,"loadedBibleSelectorSelf")).Cast<AutomationElement>());
        Require(narrow.Count<=1,"MULTIPLE_OR_MISSING_TRANSLATION_SELECTORS");if(narrow.Count==1)return narrow[0];
        var selectors=root.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.AutomationIdProperty,"loadedBibleSelectorSelf"));
        if(selectors.Count==1)return selectors[0];
        Require(selectors.Count==0,"MULTIPLE_OR_MISSING_TRANSLATION_SELECTORS");
        var loose=ByIdOrKeyword(root,"loadedBibleSelectorSelf","BibleSelector");Require(loose!=null,"MULTIPLE_OR_MISSING_TRANSLATION_SELECTORS");return loose;
    }
    static string SelectedTranslation(AutomationElement selector) {
        var cache=new CacheRequest();cache.TreeScope=TreeScope.Element;cache.TreeFilter=Automation.RawViewCondition;cache.Add(AutomationElement.NameProperty);
        AutomationElementCollection texts;using(cache.Activate()){texts=selector.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Text));}
        var names=texts.Cast<AutomationElement>().Select(e=>e.Cached.Name).Where(n=>!String.IsNullOrWhiteSpace(n)).ToArray();
        Require(names.Length==1,"TRANSLATION_SELECTION_UNCERTAIN");return names[0];
    }
    // Narrow lookup (NR-018 investigation): asking ProPresenter (WPF) for every element under its window makes it build
    // accessibility objects for everything, including constantly changing live previews, and keep updating them; it then
    // stayed at ~20% CPU and answered slowly until restarted. Walk straight down the known path instead:
    // window > MainLayout > BiblesViewer, and search only inside the Bible viewer.
    static AutomationElement BibleViewer(AutomationElement root) {
        var layout=root.FindFirst(TreeScope.Children,new PropertyCondition(AutomationElement.ClassNameProperty,"MainLayout"));if(layout==null)return null;
        return layout.FindFirst(TreeScope.Children,new PropertyCondition(AutomationElement.ClassNameProperty,"BiblesViewer"));
    }
    // Where the open edition menu can be: the Bible viewer, then ProPresenter's pop-up windows; the whole main
    // window only if neither has it after a moment (keeps the number of elements ProPresenter must expose small).
    static List<AutomationElement> EditionScopes(AutomationElement root,Process process,bool includeMain) {
        var scopes=new List<AutomationElement>();var viewer=BibleViewer(root);if(viewer!=null&&!includeMain)scopes.Add(viewer);
        foreach(AutomationElement window in AutomationElement.RootElement.FindAll(TreeScope.Children,new PropertyCondition(AutomationElement.ProcessIdProperty,process.Id))){
            bool isMain=new IntPtr(window.Current.NativeWindowHandle)==process.MainWindowHandle;if(!isMain||includeMain||viewer==null)scopes.Add(window);}
        return scopes;
    }
    // Slide labels without the slides' contents (docs/153, measured 2026-11-25 on ProPresenter 21.4.2): each slide is a
    // Thumbnail directly under the Bible viewer and holds live video previews. A descendant search walked into all of
    // them; ProPresenter then kept those accessibility objects updated, used more and more processor time and answered
    // slowly for the rest of its session. Read only each slide's own direct text (its reference label) in one request.
    // A ProPresenter without that layout falls back to the earlier full read.
    static List<AutomationElement> SlideTexts(AutomationElement viewer,bool layout) {
        var cache=new CacheRequest();cache.TreeScope=TreeScope.Element|TreeScope.Children;cache.TreeFilter=Automation.RawViewCondition;
        cache.Add(AutomationElement.NameProperty);cache.Add(AutomationElement.ControlTypeProperty);
        if(layout){cache.Add(AutomationElement.IsOffscreenProperty);cache.Add(AutomationElement.BoundingRectangleProperty);}
        AutomationElementCollection slides;using(cache.Activate()){slides=viewer.FindAll(TreeScope.Children,new PropertyCondition(AutomationElement.ClassNameProperty,"Thumbnail"));}
        var texts=new List<AutomationElement>();
        foreach(AutomationElement slide in slides)foreach(AutomationElement child in slide.CachedChildren)if(child.Cached.ControlType==ControlType.Text)texts.Add(child);
        if(slides.Count>0)return texts;
        var full=new CacheRequest();full.TreeScope=TreeScope.Element;full.TreeFilter=Automation.RawViewCondition;
        full.Add(AutomationElement.NameProperty);if(layout){full.Add(AutomationElement.IsOffscreenProperty);full.Add(AutomationElement.BoundingRectangleProperty);}
        using(full.Activate()){return viewer.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Text)).Cast<AutomationElement>().ToList();}
    }
    static AutomationElement BibleHeader(AutomationElement root) {
        var viewer=BibleViewer(root);
        if(viewer!=null){var header=ById(viewer,"bibleViewerHeader");if(header!=null)return header;}
        return null;
    }
    static AutomationElement OpenBibleView(AutomationElement root,Process process) {
        var header=BibleHeader(root)??ById(root,"bibleViewerHeader");if(header!=null)return header;
        var button=ById(root,"MAIN_MENU_VIEW_BIBLES_title");
        // Only when neither verified ID exists (a different ProPresenter version) fall back to keyword matching.
        if(button==null){header=ByIdOrKeyword(root,"bibleViewerHeader","bibleViewerHeader");if(header!=null)return header;button=ByIdOrKeyword(root,"MAIN_MENU_VIEW_BIBLES_title","VIEW_BIBLES");}
        Require(button!=null&&button.Current.IsEnabled&&!button.Current.IsOffscreen,"BIBLE_VIEW_CONTROL_UNAVAILABLE");
        Stage("open-bible-view");ClickVerifiedControl(button,process.Id);
        var timer=Stopwatch.StartNew();while(timer.ElapsedMilliseconds<6000){header=BibleHeader(root)??ById(root,"bibleViewerHeader");if(header!=null)return header;Thread.Sleep(50);}
        throw new InvalidOperationException("BIBLE_VIEW_NOT_VERIFIED");
    }
    static void SelectTranslation(AutomationElement root,Process process,AutomationElement selector,string expected) {
        if(SelectedTranslation(selector)==expected)return;
        Stage("open-installed-editions");ClickVerifiedControl(selector,process.Id);
        var timer=Stopwatch.StartNew();bool selected=false;
        while(timer.ElapsedMilliseconds<6000) {
            uint foreground;GetWindowThreadProcessId(GetForegroundWindow(),out foreground);Require(foreground==process.Id,"FOCUS_CHANGED_DURING_EDITION_SELECTION");
            var windows=EditionScopes(root,process,timer.ElapsedMilliseconds>1500);
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
        // Click freshness (2026-11-22 finding, docs/143): when ProPresenter answers slowly, the screen can change between
        // the hit test and the click, so a click meant for a menu could land on a slide. Refuse unless the whole check is
        // quick and the control has not moved.
        var fresh=Stopwatch.StartNew();
        var bounds=element.Current.BoundingRectangle;Require(!bounds.IsEmpty&&bounds.Width>1&&bounds.Height>1&&!element.Current.IsOffscreen,"SAVE_CONTROL_BOUNDS_UNAVAILABLE");
        var point=new ScreenPoint {x=(int)(bounds.X+bounds.Width/2),y=(int)(bounds.Y+bounds.Height/2)};
        uint owner;GetWindowThreadProcessId(WindowFromPoint(point),out owner);Require(owner==processId,"SAVE_CONTROL_OCCLUDED");
        var hit=AutomationElement.FromPoint(new System.Windows.Point(point.x,point.y));var expected=element.GetRuntimeId();bool matches=false;
        for(int depth=0;hit!=null&&depth<15;depth++,hit=TreeWalker.RawViewWalker.GetParent(hit))if(hit.GetRuntimeId().SequenceEqual(expected)){matches=true;break;}
        Require(matches,"SAVE_CONTROL_HIT_TEST_MISMATCH");
        var again=element.Current.BoundingRectangle;Require(Math.Abs(again.X-bounds.X)<=1&&Math.Abs(again.Y-bounds.Y)<=1&&Math.Abs(again.Width-bounds.Width)<=1&&Math.Abs(again.Height-bounds.Height)<=1,"CONTROL_MOVED_BEFORE_CLICK");
        Require(fresh.ElapsedMilliseconds<=400,"PROPRESENTER_RESPONDING_SLOWLY");
        Require(SetCursorPos(point.x,point.y),"SAVE_CONTROL_POINTER_BLOCKED");
        GetWindowThreadProcessId(GetForegroundWindow(),out owner);Require(owner==processId,"FOCUS_CHANGED_BEFORE_SAVE_CLICK");
        var down=new Input {type=0,data=new InputUnion {mouse=new MouseInput {flags=2}}};var up=new Input {type=0,data=new InputUnion {mouse=new MouseInput {flags=4}}};InputKeys(new [] {down,up});
    }
    static AutomationElement ExactSavePopupCommand(AutomationElementCollection windows,Process process) {
        // Short-circuit only the complete, uniquely scoped popup profile.
        // Different or ambiguous topology keeps the existing broad search.
        if(windows.Count!=1)return null;
        var main=windows[0];if(new IntPtr(main.Current.NativeWindowHandle)!=process.MainWindowHandle)return null;
        var popups=main.FindAll(TreeScope.Children,new AndCondition(new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Window),new PropertyCondition(AutomationElement.ProcessIdProperty,process.Id)));
        if(popups.Count!=1||popups[0].Current.IsOffscreen||!popups[0].Current.IsEnabled)return null;
        var menus=popups[0].FindAll(TreeScope.Children,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Menu));
        if(menus.Count!=1||menus[0].Current.IsOffscreen)return null;
        var cache=new CacheRequest();cache.TreeScope=TreeScope.Element;
        cache.Add(AutomationElement.NameProperty);cache.Add(AutomationElement.IsEnabledProperty);cache.Add(AutomationElement.IsOffscreenProperty);cache.Add(AutomationElement.ProcessIdProperty);
        AutomationElementCollection items;using(cache.Activate()){items=menus[0].FindAll(TreeScope.Children,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.MenuItem));}
        if(items.Count!=3)return null;
        var expected=new [] {"Save As Presentation","Copy to Selected Presentation","Save to Playlist"};
        for(int index=0;index<items.Count;index++)if(items[index].Cached.Name!=expected[index]||items[index].Cached.ProcessId!=process.Id||items[index].Cached.IsOffscreen)return null;
        if(!items[0].Cached.IsEnabled)return null;
        return items[0];
    }
    static void SaveBibleCopy(AutomationElement root,Process process,AutomationElement field,AutomationElement selector,string reference,string selected) {
        Require(Canonical(Value(field))==Canonical(reference)&&SelectedTranslation(selector)==selected,"PASSAGE_CHANGED_BEFORE_SAVE");
        uint foreground;GetWindowThreadProcessId(GetForegroundWindow(),out foreground);Require(foreground==process.Id,"FOCUS_CHANGED_BEFORE_SAVE");
        var button=ById(root,"SaveCopyDocumentButton");Require(button!=null&&button.Current.IsEnabled&&!button.Current.IsOffscreen,"SAVE_COPY_CONTROL_UNAVAILABLE");
        object invoke;
        // This split control opens its menu on pointer-down rather than Invoke.
        // Resolve and hit-test its current accessibility bounds; never use a
        // stored screen coordinate or a keyboard shortcut for an unknown view.
        Stage("open-save-copy-menu");ClickVerifiedControl(button,process.Id);Stage("save-copy-menu-opened");
        var timer=Stopwatch.StartNew();
        while(timer.ElapsedMilliseconds<2000) {
            Stage("find-save-copy-command");
            var windows=AutomationElement.RootElement.FindAll(TreeScope.Children,new PropertyCondition(AutomationElement.ProcessIdProperty,process.Id));
            var matches=new List<AutomationElement>();
            var scoped=ExactSavePopupCommand(windows,process);
            if(scoped!=null){Stage("save-copy-popup-profile-matched");matches.Add(scoped);}
            else {
                Stage("save-copy-broad-search");
                foreach(AutomationElement window in windows) {
                    var items=window.FindAll(TreeScope.Descendants,new AndCondition(new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.MenuItem),new PropertyCondition(AutomationElement.NameProperty,"Save As Presentation")));
                    matches.AddRange(items.Cast<AutomationElement>().Where(e=>e.Current.IsEnabled&&!e.Current.IsOffscreen));
                }
            }
            Require(matches.Count<=1,"SAVE_COPY_MENU_AMBIGUOUS");
            if(matches.Count==1) {
                Stage("verify-save-copy-command");
                GetWindowThreadProcessId(GetForegroundWindow(),out foreground);Require(foreground==process.Id,"FOCUS_CHANGED_IN_SAVE_MENU");
                Require(Canonical(Value(field))==Canonical(reference)&&SelectedTranslation(selector)==selected,"PASSAGE_CHANGED_IN_SAVE_MENU");
                Require(matches[0].TryGetCurrentPattern(InvokePattern.Pattern,out invoke),"SAVE_COPY_MENU_NOT_INVOKABLE");
                Stage("save-new-presentation-copy");((InvokePattern)invoke).Invoke();return;
            }
            Thread.Sleep(50);
        }
        throw new InvalidOperationException("SAVE_COPY_MENU_NOT_VERIFIED");
    }
    // The spoken verse is often already on screen (verse 1 especially): check the snapshot just read before reading again.
    static bool VerseVisibleIn(IEnumerable<AutomationElement> snapshot,AutomationElement bible,string target) {
        System.Windows.Rect area;try{area=bible.Current.BoundingRectangle;}catch(ElementNotAvailableException){return false;}if(area.IsEmpty)return false;
        foreach(AutomationElement e in snapshot){
            string name;bool offscreen;System.Windows.Rect r;
            try{name=e.Cached.Name;offscreen=e.Cached.IsOffscreen;r=e.Cached.BoundingRectangle;}catch(InvalidOperationException){return false;}
            if(Canonical(name)==target)return !offscreen&&!r.IsEmpty&&r.Top>=area.Top&&r.Bottom<=area.Bottom;
        }
        return false;
    }
    // Bring one verse slide into view by scrolling the Bible preview. Never clicks, selects or invokes a slide.
    static AutomationElement VerseLabel(AutomationElement scope,string target) {
        foreach(AutomationElement e in scope.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Text))){var name=Canonical(e.Current.Name);if(name==target)return e;}
        return null;
    }
    static bool InView(AutomationElement label,AutomationElement viewer) {
        var r=label.Current.BoundingRectangle;if(label.Current.IsOffscreen||r.IsEmpty)return false;if(viewer==null)return true;
        var v=viewer.Current.BoundingRectangle;return r.Top>=v.Top&&r.Bottom<=v.Bottom;
    }
    static AutomationElement ScrollableAncestor(AutomationElement element) {
        for(var e=TreeWalker.RawViewWalker.GetParent(element);e!=null;e=TreeWalker.RawViewWalker.GetParent(e)) {
            object pattern;if(e.TryGetCurrentPattern(ScrollPattern.Pattern,out pattern)&&((ScrollPattern)pattern).Current.VerticallyScrollable)return e;
            if(e.Current.ControlType==ControlType.Window)break;
        }
        return null;
    }
    // ProPresenter 21's slide grid exposes no scroll control, so turn the mouse wheel over it.
    // A wheel turn only scrolls; it never selects or takes a slide live. The pointer is put back afterwards.
    static bool WheelToVerse(AutomationElement anchor,string reference,string target,int verse) {
        AutomationElement grid=null;for(var e=TreeWalker.RawViewWalker.GetParent(anchor);e!=null&&e.Current.ControlType!=ControlType.Window;e=TreeWalker.RawViewWalker.GetParent(e))if(e.Current.ClassName=="BiblesViewer"){grid=e;break;}
        if(grid==null)return false;
        var processId=grid.Current.ProcessId;var rect=grid.Current.BoundingRectangle;if(rect.IsEmpty)return false;
        var centre=new ScreenPoint{x=(int)(rect.Left+rect.Width/2),y=(int)(rect.Top+rect.Height/2)};
        uint owner;GetWindowThreadProcessId(WindowFromPoint(centre),out owner);if(owner!=processId)return false;
        ScreenPoint saved;bool restore=GetCursorPos(out saved);
        var prefix=Canonical(reference)+":";
        try {
            SetCursorPos(centre.x,centre.y);
            // Reading labels costs about a second, so turn the wheel in estimated batches (about two verses per turn).
            for(int check=0;check<10;check++) {
                uint focusOwner;GetWindowThreadProcessId(GetForegroundWindow(),out focusOwner);if(focusOwner!=processId)return false;
                var texts=SlideTexts(grid,true);
                int highest=0,lowest=int.MaxValue;System.Windows.Rect found=System.Windows.Rect.Empty;
                foreach(AutomationElement e in texts){
                    var name=Canonical(e.Cached.Name);if(!name.StartsWith(prefix))continue;int n;if(!int.TryParse(name.Substring(prefix.Length),out n))continue;
                    var r=e.Cached.BoundingRectangle;bool visible=!e.Cached.IsOffscreen&&!r.IsEmpty&&r.Top>=rect.Top&&r.Bottom<=rect.Bottom;
                    if(visible){highest=Math.Max(highest,n);lowest=Math.Min(lowest,n);if(n==verse)return true;}
                }
                // Just after ProPresenter rebuilds the grid the labels can be briefly missing; look again.
                if(highest==0){Thread.Sleep(300);continue;}
                int turns=verse>highest?(verse-highest+1)/2+1:verse<lowest?-((lowest-verse+1)/2+1):0;if(turns==0){Thread.Sleep(300);continue;}
                turns=Math.Max(-20,Math.Min(20,turns));
                for(int i=0;i<Math.Abs(turns);i++){var wheel=new Input{type=0,data=new InputUnion{mouse=new MouseInput{data=unchecked((uint)(turns>0?-120:120)),flags=0x0800}}};Require(SendInput(1,new[]{wheel},Marshal.SizeOf(typeof(Input)))==1,"KEYBOARD_INPUT_BLOCKED");Thread.Sleep(40);}
                Thread.Sleep(200);
            }
            return false;
        } finally { if(restore)SetCursorPos(saved.x,saved.y); }
    }
    static bool ScrollToVerse(AutomationElement bible,string reference,int verse,int chapterVerses) {
        string target=Canonical(reference+":"+verse);
        // Slide labels only (docs/153); any realised verse label shares the slide grid's scrollable parent.
        var texts=SlideTexts(bible,false);
        var label=texts.FirstOrDefault(e=>Canonical(e.Cached.Name)==target);
        var anchor=label??texts.FirstOrDefault(e=>Regex.IsMatch(Canonical(e.Cached.Name),"^"+Regex.Escape(Canonical(reference))+@":[0-9]+$"));
        if(anchor==null)return false;
        var viewer=ScrollableAncestor(anchor);
        if(label!=null&&InView(label,viewer))return true;
        if(viewer==null)return WheelToVerse(anchor,reference,target,verse);
        var scroll=(ScrollPattern)viewer.GetCurrentPattern(ScrollPattern.Pattern);
        double percent=chapterVerses>1?100.0*(verse-1)/(chapterVerses-1):0;
        for(int attempt=0;attempt<8;attempt++) {
            scroll.SetScrollPercent(ScrollPattern.NoScroll,Math.Max(0,Math.Min(100,percent)));Thread.Sleep(150);
            label=VerseLabel(viewer,target);
            if(label!=null&&InView(label,viewer))return true;
            if(label!=null) {
                var view=viewer.Current.BoundingRectangle;var r=label.Current.BoundingRectangle;
                double content=view.Height*100.0/Math.Max(1,scroll.Current.VerticalViewSize);
                percent=scroll.Current.VerticalScrollPercent+100.0*(r.Top-view.Top-view.Height/4)/Math.Max(1,content-view.Height);
            } else percent+=attempt%2==0?6*(attempt+1):-6*(attempt+1);
        }
        return false;
    }
    // Installed versions (NR-018): open the edition menu, read its names, close it with Escape and confirm the
    // selection did not change. Read-only apart from the menu; never selects an edition or touches output.
    static List<string> ListEditions(AutomationElement root,Process process,AutomationElement selector,out string before) {
            before=SelectedTranslation(selector);Stage("open-installed-editions");ClickVerifiedControl(selector,process.Id);
            // Anchor on the selected edition: its name also appears in the open menu. The menu entry's list
            // (the nearest ancestor holding several entries) gives every installed edition.
            var names=new List<string>();var timer=Stopwatch.StartNew();var walker=TreeWalker.RawViewWalker;string debug="";
            while(timer.ElapsedMilliseconds<6000&&names.Count==0) {
                var windows=EditionScopes(root,process,timer.ElapsedMilliseconds>1500);
                foreach(AutomationElement window in windows) {
                    foreach(AutomationElement hit in window.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.NameProperty,before))) {
                        bool insideSelector=false;for(var up=walker.GetParent(hit);up!=null;up=walker.GetParent(up)){if(Automation.Compare(up,selector)){insideSelector=true;break;}}
                        if(insideSelector||hit.Current.IsOffscreen)continue;
                        debug+=hit.Current.ControlType.ProgrammaticName+"|";
                        // Step up until a level holds two or more names (the menu list), at most six levels.
                        var level=walker.GetParent(hit);
                        for(int depth=0;level!=null&&depth<6;depth++,level=walker.GetParent(level)) {
                            var found=new List<string>();
                            foreach(AutomationElement text in level.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Text))) {var name=(text.Current.Name??"").Trim();if(name.Length>0&&name.Length<=80&&!found.Contains(name))found.Add(name);}
                            debug+=depth+":"+found.Count+",";
                            if(found.Count>=2||depth==5){if(found.Count<=60)names.AddRange(found);else names.Add(before);break;}
                        }
                        if(names.Count>0)break;
                    }
                    if(names.Count>0)break;
                }
                if(names.Count==0)Thread.Sleep(80);
            }
            uint fg;GetWindowThreadProcessId(GetForegroundWindow(),out fg);if(fg==process.Id)InputKeys(new [] {Key(0x1B,0,0),Key(0x1B,0,2)});
            var settle=Stopwatch.StartNew();while(settle.ElapsedMilliseconds<800&&SelectedTranslation(selector)!=before)Thread.Sleep(50);
            Require(SelectedTranslation(selector)==before,"EDITION_CHANGED_WHILE_LISTING");Require(names.Count>0,"INSTALLED_EDITIONS_NOT_READ");
            return names;
    }
    static object Run(Dictionary<string,object> request) {
        Stage("validate-target");
        string operation=Convert.ToString(request.ContainsKey("operation")?request["operation"]:"inspect");
        Require(operation=="inspect"||operation=="prepare"||operation=="prepare-save"||operation=="prepare-chapter"||operation=="list-translations","UNKNOWN_OPERATION");
        bool listing=operation=="list-translations";if(listing)Require(request.Count==1,"INVALID_PREPARE_REQUEST");
        string reference=null,translation=null;bool chapter=operation=="prepare-chapter";int focusVerse=0,chapterVerses=0;
        if(chapter) {
            // Whole chapter for a volunteer: "Proverbs 3", positioned at the spoken verse. Scrolling only; no slide is clicked or selected.
            Require((request.Count==5||request.Count==6&&request.ContainsKey("listVersions"))&&request.ContainsKey("reference")&&request.ContainsKey("translation")&&request.ContainsKey("focusVerse")&&request.ContainsKey("chapterVerses"),"INVALID_PREPARE_REQUEST");
            reference=Convert.ToString(request["reference"]);translation=Convert.ToString(request["translation"]);
            Require(request["focusVerse"] is int&&request["chapterVerses"] is int,"INVALID_PREPARE_REQUEST");focusVerse=(int)request["focusVerse"];chapterVerses=(int)request["chapterVerses"];
            Require(reference.Length<=100&&Regex.IsMatch(reference,@"^[1-3]?[A-Za-z ]+ [1-9][0-9]{0,2}$"),"INVALID_REFERENCE_SHAPE");
            Require(chapterVerses>=1&&chapterVerses<=176&&focusVerse>=1&&focusVerse<=chapterVerses,"INVALID_FOCUS_VERSE");
            Require(Translations.ContainsKey(translation),"UNSUPPORTED_REQUESTED_TRANSLATION");
        }
        if(operation!="inspect"&&!chapter&&!listing) {
            Require(request.Count==3&&request.ContainsKey("reference")&&request.ContainsKey("translation"),"INVALID_PREPARE_REQUEST");
            reference=Convert.ToString(request["reference"]);translation=Convert.ToString(request["translation"]);
            Require(reference.Length<=100&&Regex.IsMatch(reference,@"^[1-3]?[A-Za-z ]+ [1-9][0-9]{0,2}:[1-9][0-9]{0,2}(-([1-9][0-9]{0,2}:)?[1-9][0-9]{0,2})?$"),"INVALID_REFERENCE_SHAPE");
            Require(Translations.ContainsKey(translation),"UNSUPPORTED_REQUESTED_TRANSLATION");
        }
        var processes=Process.GetProcessesByName("ProPresenter");Require(processes.Length==1,"ONE_PROPRESENTER_INSTANCE_REQUIRED");
        Stage("target-process-found");
        var process=processes[0];var expected=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),"Renewed Vision","ProPresenter","ProPresenter.exe");
        Require(String.Equals(Path.GetFullPath(process.MainModule.FileName),Path.GetFullPath(expected),StringComparison.OrdinalIgnoreCase),"UNEXPECTED_PROPRESENTER_EXECUTABLE");
        Require(process.MainWindowHandle!=IntPtr.Zero,"PROPRESENTER_WINDOW_UNAVAILABLE");
        Stage("bind-target-window");
        // Capture readiness and identity together when binding this one window.
        // Keep Full mode for the later live focus/reference/edition checks.
        var windowHandle=process.MainWindowHandle;
        var readinessCache=new CacheRequest();readinessCache.TreeScope=TreeScope.Element;readinessCache.TreeFilter=Automation.RawViewCondition;
        readinessCache.Add(AutomationElement.IsEnabledProperty);readinessCache.Add(AutomationElement.IsOffscreenProperty);
        readinessCache.Add(AutomationElement.ProcessIdProperty);readinessCache.Add(AutomationElement.NativeWindowHandleProperty);
        AutomationElement root;using(readinessCache.Activate()){root=AutomationElement.FromHandle(windowHandle);}
        Require(root.Cached.IsEnabled&&!root.Cached.IsOffscreen&&root.Cached.ProcessId==process.Id&&new IntPtr(root.Cached.NativeWindowHandle)==windowHandle,"PROPRESENTER_NOT_READY");
        Stage("target-window-bound");
        // Inspection remains read-only. Preparation has explicit application
        // consent for focus changes, opening Bibles and exact edition selection.
        // Responsiveness check before any input (docs/143): a read-only lookup of the Bible view. When ProPresenter is this
        // slow, the screen can change under a click or key press, so nothing is typed or clicked and a restart is advised.
        if(operation!="inspect"){var probe=Stopwatch.StartNew();var seen=BibleHeader(root)??ById(root,"MAIN_MENU_VIEW_BIBLES_title");Require(probe.ElapsedMilliseconds<=2500,"PROPRESENTER_RESPONDING_SLOWLY");}
        if(operation!="inspect"){Require(SetForegroundWindow(process.MainWindowHandle),"COULD_NOT_FOCUS_PROPRESENTER");WaitReleasedModifiers();}
        Stage("find-bible-controls");
        var header=operation=="inspect"?(BibleHeader(root)??ByIdOrKeyword(root,"bibleViewerHeader","bibleViewerHeader")):OpenBibleView(root,process);Require(header!=null,"OPEN_BIBLES_VIEW_IN_PROPRESENTER");
        Stage("bible-view-verified");
        // Restrict control discovery to the observed Bible viewer, rather than
        // traversing unrelated library, media, stage and production controls.
        var bibleControls=TreeWalker.RawViewWalker.GetParent(header);Require(bibleControls!=null,"BIBLE_VIEW_CONTAINER_MISSING");
        var container=ByIdOrKeyword(header,"ReferenceTextBox","Reference");Require(container!=null,"REFERENCE_CONTAINER_MISSING");
        var edits=container.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Edit));
        Require(edits.Count==1,"REFERENCE_INPUT_AMBIGUOUS");var field=edits[0];
        Require(field.Current.IsEnabled&&!field.Current.IsOffscreen,"REFERENCE_INPUT_NOT_READY");
        Stage("reference-control-verified");
        var selector=TranslationSelector(bibleControls);string selected=SelectedTranslation(selector);
        Stage("edition-control-verified");
        // Installed versions (NR-018): open the edition menu, read its names, close it with Escape and confirm the
        // selection did not change. Read-only apart from the menu; never selects an edition or touches output.
        if(listing) {
            string before;var names=ListEditions(root,process,selector,out before);
            return new {ok=true,state="translations-listed",installed=names.Take(60).ToArray(),selected=before,outputRequests=0};
        }
        // Speed (NR-020): a first whole-chapter preparation can read the installed versions in the same run,
        // so a later version request never has to stop and open the menu.
        string[] installedNow=null;if(chapter&&request.ContainsKey("listVersions")&&request["listVersions"] is bool&&(bool)request["listVersions"]){string ignored;installedNow=ListEditions(root,process,selector,out ignored).Take(60).ToArray();}
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
        while(watch.ElapsedMilliseconds<(chapter?30000:15000)) {
            Stage("verify-translation");
            Require(SelectedTranslation(selector)==selected,"TRANSLATION_CHANGED_DURING_PREPARATION");
            // Query only citation text during readiness polling. Enumerating
            // every layout/image node made a provider snapshot block long enough
            // to consume the bounded worker deadline on newly generated slides.
            Stage("read-generated-snapshot");
            var elements=SlideTexts(bible,chapter);
            var labels=elements.Select(e=>e.Cached.Name).ToArray();
            string expectedReference=Canonical(reference);
            bool rangeFound=chapter?labels.Any(n=>Canonical(n).StartsWith(expectedReference+":",StringComparison.OrdinalIgnoreCase)):labels.Any(n=>Canonical(n)==expectedReference||Canonical(n).StartsWith(expectedReference+" ",StringComparison.OrdinalIgnoreCase));count=labels.Count(n=>Regex.IsMatch(n??"",@"^[1-3]?[A-Za-z ]+ [1-9][0-9]*:[1-9][0-9]*"));
            // ProPresenter expands a chapter to its full range, e.g. "Proverbs 3" becomes "Proverbs 3:1-35".
            string fieldValue=Canonical(Value(field));bool fieldMatches=fieldValue==expectedReference||chapter&&fieldValue==expectedReference+":1-"+chapterVerses;
            Console.Error.WriteLine(Json.Serialize(new {stage="verify-check",elapsedMs=Total.ElapsedMilliseconds,fieldMatches=fieldMatches,rangeFound=rangeFound,elementCount=elements.Count,labelCount=count}));Console.Error.Flush();
            stable=fieldMatches&&rangeFound&&count>0?stable+1:0;
            // Speed (2026-11-24): every snapshot reads all slide labels (hundreds for a long chapter), which is slow and adds
            // to ProPresenter's slowdown. A whole chapter for a volunteer needs one matching snapshot; exact passages that
            // Confirm or Auto may send keep two in a row.
            if(stable>=(chapter?1:2)) {
                // The clipped-text scan costs about two seconds; a whole chapter for a volunteer skips it (the volunteer
                // sees every slide before taking it live). Exact passages for Confirm and Auto keep it.
                if(!chapter){
                Stage("read-clipping-snapshot");
                var warningCache=new CacheRequest();warningCache.TreeScope=TreeScope.Element;warningCache.Add(AutomationElement.NameProperty);warningCache.Add(AutomationElement.HelpTextProperty);
                AutomationElementCollection warnings;using(warningCache.Activate()){warnings=bible.FindAll(TreeScope.Descendants,new PropertyCondition(AutomationElement.ControlTypeProperty,ControlType.Image));}
                clipped=warnings.Cast<AutomationElement>().Any(e=>(e.Cached.HelpText??"").IndexOf("clipped",StringComparison.OrdinalIgnoreCase)>=0||(e.Cached.Name??"").IndexOf("clipped",StringComparison.OrdinalIgnoreCase)>=0);
                }
                Stage("prepared-review");
                if(chapter) {
                    Stage("scroll-to-verse");bool visible=VerseVisibleIn(elements,bible,Canonical(reference+":"+focusVerse))||ScrollToVerse(bible,reference,focusVerse,chapterVerses);
                    return new {ok=true,state="chapter-prepared-no-output",reference=reference,translation=translation,focusVerse=focusVerse,focusVisible=visible,installed=installedNow,referenceLabels=count,clippingWarning=clipped,saveCopyRequested=false,formattingVerified=false,outputRequests=0,outputObserved=false,elapsedMs=Total.ElapsedMilliseconds,timingsMs=Timings};
                }
                bool saveCopy=operation=="prepare-save";
                if(saveCopy)SaveBibleCopy(bible,process,field,selector,reference,selected);
                return new {ok=true,state="prepared-needs-operator-review",reference=reference,translation=translation,referenceLabels=count,clippingWarning=clipped,saveCopyRequested=saveCopy,formattingVerified=false,outputRequests=0,outputObserved=false,elapsedMs=Total.ElapsedMilliseconds,timingsMs=Timings};
            }
            Thread.Sleep(60);
        }
        throw new InvalidOperationException("PREPARATION_COMPLETION_NOT_VERIFIED");
    }
    // One request: every check in Run starts again from ProPresenter's current window; nothing found earlier is reused.
    static int Handle(string input) {
        try {
            Require(input!=null&&input.Length<=8192,"INVALID_REQUEST_SIZE");
            var request=Json.Deserialize<Dictionary<string,object>>(input);Require(request!=null,"INVALID_REQUEST");
            Console.WriteLine(Json.Serialize(Run(request)));return 0;
        }catch(ElementNotAvailableException){Console.WriteLine(Json.Serialize(new {ok=false,code="NATIVE_UI_ELEMENT_REPLACED",outputRequests=0}));return 3;}
        catch(InvalidOperationException e){Console.WriteLine(Json.Serialize(new {ok=false,code=e.Message,outputRequests=0}));return 2;}
        catch{Console.WriteLine(Json.Serialize(new {ok=false,code="NATIVE_UI_ACCESS_UNCERTAIN",outputRequests=0}));return 3;}
        finally{Console.Out.Flush();}
    }
    // --serve (NR-020): stay running for the service so each passage skips starting the helper and the accessibility
    // client. One JSON request per line, one JSON reply per line, strictly in turn. Exits when VerseCue closes the pipe.
    [MTAThread] static int Main(string[] args) {
        SetProcessDPIAware();
        if(args.Length==1&&args[0]=="--serve"){
            string line;while((line=Console.ReadLine())!=null){Total.Restart();Timings.Clear();Handle(line);}
            return 0;
        }
        return Handle(Console.ReadLine());
    }
}
