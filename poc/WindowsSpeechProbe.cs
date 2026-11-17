// THROWAWAY DIAGNOSTIC — NOT PRODUCTION CODE
// Installed desktop recognizer and an existing WAV only; never opens a microphone.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Speech.Recognition;
using System.Threading;
using System.Web.Script.Serialization;
public static class WindowsSpeechProbe {
  [MTAThread] public static int Main(string[] args) {
    if(args.Length!=1)return 2;
    var watch=Stopwatch.StartNew();var phrases=new List<object>();var stage="create-engine";
    try{RecognizerInfo selected=null;foreach(var installed in SpeechRecognitionEngine.InstalledRecognizers())if(installed.Culture.Name=="en-US")selected=installed;if(selected==null){Console.Error.WriteLine("NO_INSTALLED_EN_US_RECOGNIZER");return 3;}
    using(var engine=new SpeechRecognitionEngine(selected))using(var completed=new ManualResetEvent(false)){
      stage="load-dictation";engine.LoadGrammar(new DictationGrammar());stage="set-file-input";engine.SetInputToWaveFile(args[0]);stage="recognize";
      engine.SpeechRecognized+=(sender,e)=>{lock(phrases){phrases.Add(new {text=e.Result.Text,score=e.Result.Confidence,scoreIsCalibrated=false});}};
      engine.RecognizeCompleted+=(sender,e)=>completed.Set();engine.RecognizeAsync(RecognizeMode.Multiple);
      if(!completed.WaitOne(20000)){engine.RecognizeAsyncCancel();completed.WaitOne(1000);throw new TimeoutException();}
    }
    Console.WriteLine(new JavaScriptSerializer().Serialize(new {elapsedMs=watch.ElapsedMilliseconds,phrases=phrases,microphoneCapture=false,outputRequests=0}));return 0;
    }catch(Exception error){Console.Error.WriteLine(new JavaScriptSerializer().Serialize(new {stage=stage,errorType=error.GetType().Name,hresult=error.HResult,microphoneCapture=false,outputRequests=0}));return 1;}
  }
}
