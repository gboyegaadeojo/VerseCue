// VerseCue Windows installer (NR-023). Installs for the current Windows user only, with no administrator rights:
// %LOCALAPPDATA%\Programs\VerseCue, Start-menu and desktop shortcuts, and an entry in Settings > Apps so it can be
// uninstalled. The app is the packaged ZIP embedded in this file. Nothing outside this user's profile is changed.
// Test options: --silent (no windows), --target <folder> (install elsewhere), --no-register (no shortcuts or Apps entry).
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

static class Setup {
    const string UninstallKey=@"Software\Microsoft\Windows\CurrentVersion\Uninstall\VerseCue";
    static string Version(){var v=Assembly.GetExecutingAssembly().GetName().Version;return v.Major+"."+v.Minor+"."+v.Build;}

    [STAThread] static int Main(string[] args) {
        bool silent=args.Contains("--silent"),register=!args.Contains("--no-register");
        int at=Array.IndexOf(args,"--target");
        string target=at>=0&&at+1<args.Length?Path.GetFullPath(args[at+1]):Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Programs","VerseCue");
        string version=Version();
        try {
            if(!silent&&MessageBox.Show("Install VerseCue "+version+" for this Windows user?\n\nIt will be installed in:\n"+target+"\n\nNo administrator rights are needed.","VerseCue setup",MessageBoxButtons.OKCancel,MessageBoxIcon.Information)!=DialogResult.OK)return 1;
            WaitForClosed(target,silent);
            if(silent)Install(target,null);else RunWithProgress(target);
            if(register){Shortcuts(target);Register(target,version);}
            if(!silent&&MessageBox.Show("VerseCue "+version+" is installed.\n\nOpen VerseCue now?","VerseCue setup",MessageBoxButtons.YesNo,MessageBoxIcon.Information)==DialogResult.Yes)
                Process.Start(new ProcessStartInfo(Path.Combine(target,"VerseCue.exe")){UseShellExecute=true,WorkingDirectory=target});
            if(silent)Console.WriteLine("Installed VerseCue "+version+" in "+target);
            return 0;
        } catch(Exception e) {
            if(silent)Console.Error.WriteLine(e.Message);else MessageBox.Show("VerseCue could not be installed:\n\n"+e.Message,"VerseCue setup",MessageBoxButtons.OK,MessageBoxIcon.Error);
            return 2;
        }
    }

    // An open VerseCue would lock its files. Ask the operator to close it; never close it ourselves.
    static void WaitForClosed(string target,bool silent) {
        string exe=Path.Combine(target,"VerseCue.exe");
        while(Process.GetProcessesByName("VerseCue").Any(p=>{try{return String.Equals(p.MainModule.FileName,exe,StringComparison.OrdinalIgnoreCase);}catch{return false;}})) {
            if(silent)throw new Exception("VerseCue is running from "+target+". Close it first.");
            if(MessageBox.Show("VerseCue is open. Close it, then press Retry.","VerseCue setup",MessageBoxButtons.RetryCancel,MessageBoxIcon.Warning)!=DialogResult.Retry)throw new Exception("Setup was cancelled because VerseCue is open.");
        }
    }

    static void RunWithProgress(string target) {
        var form=new Form{Text="Installing VerseCue",Width=420,Height=130,FormBorderStyle=FormBorderStyle.FixedDialog,MaximizeBox=false,MinimizeBox=false,StartPosition=FormStartPosition.CenterScreen,ControlBox=false};
        var label=new Label{Text="Copying files…",Left=16,Top=14,Width=370};var bar=new ProgressBar{Left=16,Top=42,Width=370,Height=20,Maximum=1000};
        form.Controls.Add(label);form.Controls.Add(bar);Exception failure=null;
        form.Shown+=(s,e)=>new Thread(()=>{try{Install(target,p=>form.BeginInvoke((Action)(()=>bar.Value=Math.Min(1000,(int)(p*1000)))));}catch(Exception x){failure=x;}form.BeginInvoke((Action)form.Close);}){IsBackground=true}.Start();
        Application.Run(form);if(failure!=null)throw failure;
    }

    // Unpack into a new folder beside the target, then swap it in, so a failed install never leaves half a copy.
    static void Install(string target,Action<double> progress) {
        string parent=Path.GetDirectoryName(target),fresh=target+".new",old=target+".old";Directory.CreateDirectory(parent);
        if(Directory.Exists(fresh))Directory.Delete(fresh,true);if(Directory.Exists(old))Directory.Delete(old,true);
        using(var stream=Assembly.GetExecutingAssembly().GetManifestResourceStream("VerseCue.zip"))
        using(var zip=new ZipArchive(stream,ZipArchiveMode.Read)) {
            var entries=zip.Entries.Where(e=>e.Name.Length>0).ToList();long total=entries.Sum(e=>e.Length),done=0;string freshRoot=Path.GetFullPath(fresh)+Path.DirectorySeparatorChar;
            foreach(var entry in entries) {
                // The ZIP holds one top folder (VerseCue-x.y.z-win32-x64); its contents become the install folder.
                int slash=entry.FullName.IndexOfAny(new[]{'/','\\'});string relative=slash>=0?entry.FullName.Substring(slash+1):entry.FullName;
                string file=Path.GetFullPath(Path.Combine(fresh,relative));if(!file.StartsWith(freshRoot,StringComparison.OrdinalIgnoreCase))throw new Exception("Unsafe path in the package: "+entry.FullName);
                Directory.CreateDirectory(Path.GetDirectoryName(file));entry.ExtractToFile(file,true);done+=entry.Length;if(progress!=null&&total>0)progress((double)done/total);
            }
        }
        if(!File.Exists(Path.Combine(fresh,"VerseCue.exe")))throw new Exception("The package does not contain VerseCue.exe.");
        if(Directory.Exists(target))Directory.Move(target,old);
        Directory.Move(fresh,target);
        if(Directory.Exists(old))try{Directory.Delete(old,true);}catch{}
    }

    static void Shortcuts(string target) {
        string exe=Path.Combine(target,"VerseCue.exe");
        Shortcut(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs),"VerseCue.lnk"),exe,target);
        Shortcut(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),"VerseCue.lnk"),exe,target);
    }
    static void Shortcut(string link,string exe,string folder) {
        var shellType=Type.GetTypeFromProgID("WScript.Shell");object shell=Activator.CreateInstance(shellType);
        object lnk=shellType.InvokeMember("CreateShortcut",BindingFlags.InvokeMethod,null,shell,new object[]{link});var t=lnk.GetType();
        t.InvokeMember("TargetPath",BindingFlags.SetProperty,null,lnk,new object[]{exe});t.InvokeMember("WorkingDirectory",BindingFlags.SetProperty,null,lnk,new object[]{folder});
        t.InvokeMember("IconLocation",BindingFlags.SetProperty,null,lnk,new object[]{exe+",0"});t.InvokeMember("Description",BindingFlags.SetProperty,null,lnk,new object[]{"VerseCue"});
        t.InvokeMember("Save",BindingFlags.InvokeMethod,null,lnk,null);
    }
    static void Register(string target,string version) {
        long bytes=new DirectoryInfo(target).EnumerateFiles("*",SearchOption.AllDirectories).Sum(f=>f.Length);
        using(var key=Registry.CurrentUser.CreateSubKey(UninstallKey)) {
            key.SetValue("DisplayName","VerseCue");key.SetValue("DisplayVersion",version);key.SetValue("Publisher","VerseCue");
            key.SetValue("DisplayIcon",Path.Combine(target,"VerseCue.exe")+",0");key.SetValue("InstallLocation",target);
            key.SetValue("UninstallString","\""+Path.Combine(target,"Uninstall VerseCue.exe")+"\"");key.SetValue("URLInfoAbout","https://github.com/gboyegaadeojo/VerseCue");
            key.SetValue("NoModify",1,RegistryValueKind.DWord);key.SetValue("NoRepair",1,RegistryValueKind.DWord);key.SetValue("EstimatedSize",(int)(bytes/1024),RegistryValueKind.DWord);
        }
    }
}
