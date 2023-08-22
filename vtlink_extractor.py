import re
import requests
import os

input_keyword = input("Video Keyword: ")
input_keyword = input_keyword.replace(" ", "-")
url = f"https://www.tiktok.com/discover/{input_keyword}"

response = requests.get(url)
content = response.text

regex_pattern = r"/(@[\w\d_]+)/video/(\d+)"
matches = re.findall(regex_pattern, content)
formatted_urls = [f"https://www.tiktok.com/{username}/video/{video_id}" for username, video_id in matches]

existing_urls = set()
if os.path.exists("vt_url.txt"):
    with open("vt_url.txt", "r") as file:
        for line in file:
            existing_urls.add(line.strip())

new_urls = [formatted_url for formatted_url in formatted_urls if formatted_url not in existing_urls]

if new_urls:
    if not os.path.exists("vt_url.txt"):
        with open("vt_url.txt", "a") as file:
            for formatted_url in formatted_urls:
                file.write(formatted_url + "\n")
                print(f"=> {formatted_url} [ OK ]")
    else:
        with open("vt_url.txt", "a") as file:
            for new_url in new_urls:
                if new_url in existing_urls:
                    print(f"=> {new_url} [ DUPLICATE ]")
                else:
                    file.write(new_url + "\n")
                    print(f"=> {new_url} [ OK ]")
else:
    print("All urls are already in vt_url.txt")
