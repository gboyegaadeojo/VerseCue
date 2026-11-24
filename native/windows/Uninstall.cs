// VerseCue uninstaller (NR-023), placed in the install folder and listed in Settings > Apps. Removes the program folder,
// its shortcuts and the Apps entry; asks before removing settings (%APPDATA%\VerseCue). A running program cannot delete
// its own folder, so it copies itself to the temporary folder and continues from there.
// Test options: --silent (no windows; settings kept unless --remove-settings), --target <folder>.
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using Microsoft.Win32;

static class Uninstall {
    const string UninstallKey=@"Software\Microsoft\Windows\CurrentVersion\Uninstall\VerseCue";
    static bool PointsInto(string link,string folder) {
        try {
            var shellType=Type.GetTypeFromProgID("WScript.Shell");object shell=Activator.CreateInstance(shellType);
            object lnk=shellType.InvokeMember("CreateShortcut",System.Reflection.BindingFlags.InvokeMethod,null,shell,new object[]{link});
            string target=Convert.ToString(lnk.GetType().InvokeMember("TargetPath",System.Reflection.BindingFlags.GetProperty,null,lnk,null));
            string root=Path.GetFullPath(folder).TrimEnd('\\')+"\\";
            return !String.IsNullOrEmpty(target)&&Path.GetFullPath(target).StartsWith(root,StringComparison.OrdinalIgnoreCase);
        } catch { return false; }
    }
    [STAThread] static int Main(string[] args) {
        bool silent=args.Contains("--silent");int at=Array.IndexOf(args,"--target");
        string self=Process.GetCurrentProcess().MainModule.FileName;
        string target=at>=0&&at+1<args.Length?Path.GetFullPath(args[at+1]):Path.GetDirectoryName(self);
        try {
            if(!File.Exists(Path.Combine(target,"VerseCue.exe")))throw new Exception("VerseCue was not found in "+target+".");
            // Step 1: running from inside the install folder, so continue from a copy in the temporary folder.
            if(String.Equals(Path.GetDirectoryName(self),target,StringComparison.OrdinalIgnoreCase)) {
                if(!silent&&MessageBox.Show("Uninstall VerseCue from this Windows user?","Uninstall VerseCue",MessageBoxButtons.OKCancel,MessageBoxIcon.Question)!=DialogResult.OK)return 1;
                string copy=Path.Combine(Path.GetTempPath(),"VerseCue-uninstall-"+Guid.NewGuid().ToString("N")+".exe");File.Copy(self,copy);
                // The copy waits for this process to exit (releasing its file in the folder) before removing anything.
                Process.Start(new ProcessStartInfo(copy,"--target \""+target+"\" --confirmed --wait-pid "+Process.GetCurrentProcess().Id+(silent?" --silent":"")+(args.Contains("--remove-settings")?" --remove-settings":"")){UseShellExecute=false});
                return 0;
            }
            int waitAt=Array.IndexOf(args,"--wait-pid");
            if(waitAt>=0&&waitAt+1<args.Length){try{Process.GetProcessById(int.Parse(args[waitAt+1])).WaitForExit(30000);}catch(ArgumentException){}}
            if(!silent&&!args.Contains("--confirmed")&&MessageBox.Show("Uninstall VerseCue from this Windows user?","Uninstall VerseCue",MessageBoxButtons.OKCancel,MessageBoxIcon.Question)!=DialogResult.OK)return 1;
            while(Process.GetProcessesByName("VerseCue").Any(p=>{try{return p.MainModule.FileName.StartsWith(target,StringComparison.OrdinalIgnoreCase);}catch{return false;}})) {
                if(silent)throw new Exception("VerseCue is running. Close it first.");
                if(MessageBox.Show("VerseCue is open. Close it, then press Retry.","Uninstall VerseCue",MessageBoxButtons.RetryCancel,MessageBoxIcon.Warning)!=DialogResult.Retry)return 1;
            }
            // Step 2: remove the program, shortcuts pointing to it and the Apps entry (only if it points to this folder).
            Directory.Delete(target,true);
            // Only shortcuts that open the copy being removed; another install's shortcuts are left alone (2026-11-24 fix).
            foreach(var link in new[]{Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs),"VerseCue.lnk"),Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),"VerseCue.lnk")})
                if(File.Exists(link)&&PointsInto(link,target))File.Delete(link);
            using(var key=Registry.CurrentUser.OpenSubKey(UninstallKey)){if(key!=null&&String.Equals(Convert.ToString(key.GetValue("InstallLocation")),target,StringComparison.OrdinalIgnoreCase)){key.Close();Registry.CurrentUser.DeleteSubKeyTree(UninstallKey,false);}}
            string settings=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),"VerseCue");
            bool removeSettings=args.Contains("--remove-settings")||!silent&&Directory.Exists(settings)&&MessageBox.Show("VerseCue is uninstalled.\n\nAlso remove your VerseCue settings and saved profiles?\n(Keep them if you might install VerseCue again.)","Uninstall VerseCue",MessageBoxButtons.YesNo,MessageBoxIcon.Question,MessageBoxDefaultButton.Button2)==DialogResult.Yes;
            if(removeSettings&&Directory.Exists(settings))Directory.Delete(settings,true);
            if(silent)Console.WriteLine("Uninstalled VerseCue from "+target);
            return 0;
        } catch(Exception e) {
            if(silent)Console.Error.WriteLine(e.Message);else MessageBox.Show("VerseCue could not be uninstalled:\n\n"+e.Message,"Uninstall VerseCue",MessageBoxButtons.OK,MessageBoxIcon.Error);
            return 2;
        } finally {
            // A temporary copy deletes itself a moment after it exits, whether or not the uninstall succeeded.
            if(Path.GetFileName(self).StartsWith("VerseCue-uninstall-",StringComparison.OrdinalIgnoreCase)&&Path.GetDirectoryName(self).TrimEnd('\\').Equals(Path.GetTempPath().TrimEnd('\\'),StringComparison.OrdinalIgnoreCase))
                Process.Start(new ProcessStartInfo("cmd.exe","/c ping 127.0.0.1 -n 3 > nul & del \""+self+"\""){CreateNoWindow=true,UseShellExecute=false});
        }
    }
}
