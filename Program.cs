using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Newtonsoft.Json;

namespace video_stream_sample
{
    class VideoConfig{
        public string path{get;set;}
        public string name{get;set;}
        public string desc{get;set;}

        public override string ToString(){
            return $"{name} {desc} {path}";
        }
    }
    class Program
    {
        const string templateHead = 
@"<html>
<head>
<meta name=""viewport"" content=""width=device-width, initial-scale=1"">
<style>
.collapsible {
    background-color: #777;
    color: white;
    cursor: pointer;
    padding: 18px;
    width: 100%;
    border: none;
    text-align: left;
    outline: none;
    font-size: 15px;
}

.active, .collapsible:hover {
    background-color: #555;
}

.content {
    padding: 0 18px;
    display: none;
    overflow: hidden;
    background-color: #f1f1f1;
}
</style>
</head>
<body>";
        const string templateDiv =
@"
<button class=""collapsible"">{0}</button>
<div class=""content"">
";
        const string templateEnd =
@"
<script>
var coll = document.getElementsByClassName(""collapsible"");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener(""click"", function() {
    this.classList.toggle(""active"");
    var content = this.nextElementSibling;
    if (content.style.display === ""block"") {
      content.style.display = ""none"";
    } else {
      content.style.display = ""block"";
    }
  });
}
</script>

</body>
</html>
";
        static string[] ReadConfig(){
            return File.ReadAllLines("dir.txt");
        }

        static void Main(string[] args)
        {
            string[] dirs;
            if(args.Length > 0){
                dirs = args;
            }
            else{
                dirs = ReadConfig();
            }

            Dictionary<string,VideoConfig> VideoConfigs = new Dictionary<string, VideoConfig>();
            StringBuilder videoList = new StringBuilder();
            int id = 1000;
            using (StringWriter sw = new StringWriter(videoList))
            {
                sw.WriteLine(templateHead);
                foreach (var dir in dirs)
                {
                    if(Directory.Exists(dir)){
                        sw.WriteLine(templateDiv,dir);
                        foreach (var file in Directory.EnumerateFiles(dir,"*.mp4",SearchOption.TopDirectoryOnly))
                        {
                            var video = new VideoConfig(){
                                path = file,
                                name = Path.GetFileNameWithoutExtension(file),
                                desc = "lorem"
                            };
                            Console.WriteLine($"{id} {video}");
                            VideoConfigs.Add(id.ToString(),video);
                            sw.WriteLine($"<a href=\"/play/{id}\">{video.name}</a><br/>");
                            id++;
                        }
                        sw.WriteLine("</div>");
                    }
                }
                sw.WriteLine(templateEnd);
            }
            File.WriteAllText("videoConfig.json",JsonConvert.SerializeObject(VideoConfigs,Formatting.Indented));
            File.WriteAllText("videoList.html",videoList.ToString());
        }
    }
}
