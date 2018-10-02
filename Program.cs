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
    }
    class Program
    {
        static void Main(string[] args)
        {
            Dictionary<string,VideoConfig> VideoConfigs = new Dictionary<string, VideoConfig>();
            StringBuilder videoList = new StringBuilder();
            int id = 1000;
            using (StringWriter sw = new StringWriter(videoList))
            {
                sw.WriteLine("<html>");
                foreach (var arg in args)
                {
                    if(Directory.Exists(arg)){
                        foreach (var file in Directory.EnumerateFiles(arg,"*.mp4",SearchOption.TopDirectoryOnly))
                        {
                            var video = new VideoConfig(){
                                path = file,
                                name = Path.GetFileNameWithoutExtension(file),
                                desc = "lorem"
                            };
                            VideoConfigs.Add(id.ToString(),video);
                            sw.WriteLine($"<a href=\"/play/{id}\">{video.name}</a><br/>");
                            id++;
                        }
                    }
                }
                sw.WriteLine("</html>");
            }
            File.WriteAllText("videoConfig.json",JsonConvert.SerializeObject(VideoConfigs,Formatting.Indented));
            File.WriteAllText("videoList.html",videoList.ToString());
        }
    }
}
