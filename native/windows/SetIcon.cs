// Packaging tool: replaces the main icon of a freshly packaged VerseCue.exe with assets/icons/versecue.ico.
// Uses the standard Windows resource update API on the build output only; it never touches an installed program.
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;

class SetIcon {
    [DllImport("kernel32.dll",SetLastError=true,CharSet=CharSet.Unicode)] static extern IntPtr LoadLibraryEx(string file,IntPtr reserved,uint flags);
    [DllImport("kernel32.dll")] static extern bool FreeLibrary(IntPtr module);
    delegate bool EnumNames(IntPtr module,IntPtr type,IntPtr name,IntPtr param);
    delegate bool EnumLanguages(IntPtr module,IntPtr type,IntPtr name,ushort language,IntPtr param);
    [DllImport("kernel32.dll",SetLastError=true)] static extern bool EnumResourceNames(IntPtr module,IntPtr type,EnumNames callback,IntPtr param);
    [DllImport("kernel32.dll",SetLastError=true)] static extern bool EnumResourceLanguages(IntPtr module,IntPtr type,IntPtr name,EnumLanguages callback,IntPtr param);
    [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr FindResourceEx(IntPtr module,IntPtr type,IntPtr name,ushort language);
    [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr LoadResource(IntPtr module,IntPtr info);
    [DllImport("kernel32.dll",SetLastError=true)] static extern IntPtr LockResource(IntPtr data);
    [DllImport("kernel32.dll",SetLastError=true)] static extern uint SizeofResource(IntPtr module,IntPtr info);
    [DllImport("kernel32.dll",SetLastError=true,CharSet=CharSet.Unicode)] static extern IntPtr BeginUpdateResource(string file,bool deleteExisting);
    [DllImport("kernel32.dll",SetLastError=true)] static extern bool UpdateResource(IntPtr update,IntPtr type,IntPtr name,ushort language,byte[] data,uint size);
    [DllImport("kernel32.dll",SetLastError=true)] static extern bool EndUpdateResource(IntPtr update,bool discard);
    static readonly IntPtr RT_ICON=(IntPtr)3,RT_GROUP_ICON=(IntPtr)14;

    static int Main(string[] args) {
        try {
            if(args.Length!=2)throw new Exception("Usage: SetIcon <exe> <ico>");
            string exe=Path.GetFullPath(args[0]);byte[] ico=File.ReadAllBytes(args[1]);
            if(ico.Length<6||BitConverter.ToUInt16(ico,0)!=0||BitConverter.ToUInt16(ico,2)!=1)throw new Exception("Not an icon file");
            int count=BitConverter.ToUInt16(ico,4);if(count<1||count>32||ico.Length<6+16*count)throw new Exception("Invalid icon directory");

            // Find the existing main icon group (its name and language) and the icon IDs it uses.
            IntPtr group=IntPtr.Zero;ushort language=0;var oldIds=new List<ushort>();
            IntPtr module=LoadLibraryEx(exe,IntPtr.Zero,0x2);if(module==IntPtr.Zero)throw new Exception("Cannot read "+exe);
            try {
                EnumResourceNames(module,RT_GROUP_ICON,(m,t,n,p)=>{group=n;return false;},IntPtr.Zero);
                if(group==IntPtr.Zero)throw new Exception("No icon group in "+exe);
                if(((long)group>>16)!=0)throw new Exception("Named icon groups are not supported");
                EnumResourceLanguages(module,RT_GROUP_ICON,group,(m,t,n,l,p)=>{language=l;return false;},IntPtr.Zero);
                IntPtr info=FindResourceEx(module,RT_GROUP_ICON,group,language);uint size=SizeofResource(module,info);
                byte[] old=new byte[size];Marshal.Copy(LockResource(LoadResource(module,info)),old,0,(int)size);
                int oldCount=BitConverter.ToUInt16(old,4);for(int i=0;i<oldCount;i++)oldIds.Add(BitConverter.ToUInt16(old,6+14*i+12));
            } finally { FreeLibrary(module); }

            IntPtr update=BeginUpdateResource(exe,false);if(update==IntPtr.Zero)throw new Exception("Cannot open "+exe+" for update");
            bool ok=false;
            try {
                var groupData=new MemoryStream();var w=new BinaryWriter(groupData);w.Write((ushort)0);w.Write((ushort)1);w.Write((ushort)count);
                var newIds=new List<ushort>();
                for(int i=0;i<count;i++) {
                    int e=6+16*i;uint bytes=BitConverter.ToUInt32(ico,e+8),offset=BitConverter.ToUInt32(ico,e+12);
                    if(offset+bytes>ico.Length)throw new Exception("Icon entry outside the file");
                    byte[] image=new byte[bytes];Array.Copy(ico,offset,image,0,bytes);
                    ushort id=i<oldIds.Count?oldIds[i]:(ushort)(1000+i);newIds.Add(id);
                    if(!UpdateResource(update,RT_ICON,(IntPtr)id,language,image,bytes))throw new Exception("Icon image update failed");
                    w.Write(ico[e]);w.Write(ico[e+1]);w.Write(ico[e+2]);w.Write((byte)0);w.Write(BitConverter.ToUInt16(ico,e+4));w.Write(BitConverter.ToUInt16(ico,e+6));w.Write(bytes);w.Write(id);
                }
                // Remove the old images the new group no longer uses.
                foreach(var id in oldIds)if(!newIds.Contains(id))UpdateResource(update,RT_ICON,(IntPtr)id,language,null,0);
                byte[] g=groupData.ToArray();
                if(!UpdateResource(update,RT_GROUP_ICON,group,language,g,(uint)g.Length))throw new Exception("Icon group update failed");
                ok=true;
            } finally { if(!EndUpdateResource(update,!ok)&&ok)throw new Exception("Writing the icon failed"); }
            Console.WriteLine("Set the VerseCue icon on "+Path.GetFileName(exe)+".");return 0;
        } catch(Exception e) { Console.Error.WriteLine(e.Message);return 1; }
    }
}
