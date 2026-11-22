// Packaging tool: replaces the main icon of a freshly packaged VerseCue.exe with assets/icons/versecue.ico and, when a
// version is given, its version information (name, description, version) so Windows shows VerseCue, not Electron.
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
    static readonly IntPtr RT_ICON=(IntPtr)3,RT_GROUP_ICON=(IntPtr)14,RT_VERSION=(IntPtr)16;
    // VS_VERSIONINFO block: length, value length, type, key (UTF-16, null-terminated), 32-bit padding, value, children.
    static byte[] Block(string key,byte[] value,ushort type,ushort valueLength,params byte[][] children) {
        var m=new MemoryStream();var w=new BinaryWriter(m);w.Write((ushort)0);w.Write(valueLength);w.Write(type);
        w.Write(System.Text.Encoding.Unicode.GetBytes(key+"\0"));while(m.Length%4!=0)w.Write((byte)0);
        if(value!=null){w.Write(value);while(m.Length%4!=0)w.Write((byte)0);}
        foreach(var child in children){w.Write(child);while(m.Length%4!=0)w.Write((byte)0);}
        var bytes=m.ToArray();BitConverter.GetBytes((ushort)bytes.Length).CopyTo(bytes,0);return bytes;
    }
    static byte[] Text(string key,string value){return Block(key,System.Text.Encoding.Unicode.GetBytes(value+"\0"),1,(ushort)(value.Length+1));}
    static byte[] VersionInfo(string version) {
        var parts=version.Split('.');if(parts.Length!=3)throw new Exception("Version must look like 1.2.3");
        ushort major=ushort.Parse(parts[0]),minor=ushort.Parse(parts[1]),patch=ushort.Parse(parts[2]);
        var f=new MemoryStream();var w=new BinaryWriter(f);uint ms=((uint)major<<16)|minor,ls=(uint)patch<<16;
        foreach(uint v in new uint[]{0xFEEF04BD,0x00010000,ms,ls,ms,ls,0x3F,0,0x40004,1,0,0,0})w.Write(v);
        string full=version+".0";
        var strings=Block("040904b0",null,1,0,Text("CompanyName","VerseCue"),Text("FileDescription","VerseCue"),Text("FileVersion",full),Text("InternalName","VerseCue"),
            Text("LegalCopyright","Copyright (c) 2026 Gboyega. MIT License."),Text("OriginalFilename","VerseCue.exe"),Text("ProductName","VerseCue"),Text("ProductVersion",full));
        var translation=Block("Translation",BitConverter.GetBytes((uint)0x04B00409),0,4);
        return Block("VS_VERSION_INFO",f.ToArray(),0,52,Block("StringFileInfo",null,1,0,strings),Block("VarFileInfo",null,1,0,translation));
    }

    static int Main(string[] args) {
        try {
            if(args.Length!=2&&args.Length!=3)throw new Exception("Usage: SetIcon <exe> <ico> [version]");
            string exe=Path.GetFullPath(args[0]);byte[] ico=File.ReadAllBytes(args[1]);
            if(ico.Length<6||BitConverter.ToUInt16(ico,0)!=0||BitConverter.ToUInt16(ico,2)!=1)throw new Exception("Not an icon file");
            int count=BitConverter.ToUInt16(ico,4);if(count<1||count>32||ico.Length<6+16*count)throw new Exception("Invalid icon directory");

            // Find the existing main icon group (its name and language) and the icon IDs it uses.
            IntPtr group=IntPtr.Zero;ushort language=0;var oldIds=new List<ushort>();IntPtr versionName=(IntPtr)1;ushort versionLanguage=0x409;
            IntPtr module=LoadLibraryEx(exe,IntPtr.Zero,0x2);if(module==IntPtr.Zero)throw new Exception("Cannot read "+exe);
            try {
                EnumResourceNames(module,RT_GROUP_ICON,(m,t,n,p)=>{group=n;return false;},IntPtr.Zero);
                if(group==IntPtr.Zero)throw new Exception("No icon group in "+exe);
                if(((long)group>>16)!=0)throw new Exception("Named icon groups are not supported");
                EnumResourceLanguages(module,RT_GROUP_ICON,group,(m,t,n,l,p)=>{language=l;return false;},IntPtr.Zero);
                IntPtr info=FindResourceEx(module,RT_GROUP_ICON,group,language);uint size=SizeofResource(module,info);
                byte[] old=new byte[size];Marshal.Copy(LockResource(LoadResource(module,info)),old,0,(int)size);
                int oldCount=BitConverter.ToUInt16(old,4);for(int i=0;i<oldCount;i++)oldIds.Add(BitConverter.ToUInt16(old,6+14*i+12));
                if(args.Length==3){bool found=false;EnumResourceNames(module,RT_VERSION,(m,t,n,p)=>{versionName=n;found=true;return false;},IntPtr.Zero);
                    if(found)EnumResourceLanguages(module,RT_VERSION,versionName,(m,t,n,l,p)=>{versionLanguage=l;return false;},IntPtr.Zero);}
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
                if(args.Length==3){byte[] info=VersionInfo(args[2]);if(!UpdateResource(update,RT_VERSION,versionName,versionLanguage,info,(uint)info.Length))throw new Exception("Version information update failed");}
                ok=true;
            } finally { if(!EndUpdateResource(update,!ok)&&ok)throw new Exception("Writing the icon failed"); }
            Console.WriteLine("Set the VerseCue icon"+(args.Length==3?" and version "+args[2]:"")+" on "+Path.GetFileName(exe)+".");return 0;
        } catch(Exception e) { Console.Error.WriteLine(e.Message);return 1; }
    }
}
