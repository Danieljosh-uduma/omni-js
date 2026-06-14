import os

src_dir = r"c:\Users\user\OneDrive\Desktop\WORK\omni-js\docs\src"

files = [
    {
        "name": "BlockStack.omni",
        "html": "&lt;main class=\"flex flex-col gap-4\"&gt;\n  &lt;section&gt;\n    &lt;div&gt;\n      &lt;p&gt;Content here&lt;/p&gt;\n    &lt;/div&gt;\n  &lt;/section&gt;\n&lt;/main&gt;"
    },
    {
        "name": "BlockText.omni",
        "html": "&lt;h1 class=\"text-2xl font-bold\"&gt;My Website&lt;/h1&gt;\n&lt;h2&gt;About Us&lt;/h2&gt;\n&lt;p&gt;We build cool things.&lt;/p&gt;\n&lt;span&gt;Inline text&lt;/span&gt;"
    },
    {
        "name": "BlockAction.omni",
        "html": "&lt;button class=\"bg-blue-500\"&gt;Click Me&lt;/button&gt;\n&lt;a href=\"https://google.com\"&gt;Go to Google&lt;/a&gt;"
    },
    {
        "name": "BlockForm.omni",
        "html": "&lt;form&gt;\n  &lt;label&gt;Email&lt;/label&gt;\n  &lt;input type=\"email\" placeholder=\"Enter email\" /&gt;\n&lt;/form&gt;"
    },
    {
        "name": "BlockCollection.omni",
        "html": "&lt;ul&gt;\n  &lt;li&gt;Item 1&lt;/li&gt;\n  &lt;li&gt;Item 2&lt;/li&gt;\n&lt;/ul&gt;"
    },
    {
        "name": "BlockMedia.omni",
        "html": "&lt;img src=\"/logo.png\" alt=\"Logo\" /&gt;\n&lt;video src=\"/promo.mp4\" autoplay loop&gt;&lt;/video&gt;"
    }
]

for item in files:
    path = os.path.join(src_dir, item["name"])
    if not os.path.exists(path):
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "Equivalent HTML output" in content:
        continue
        
    # Find the end of the first code block
    pos = content.find("</Stack>\n\n  <Text class=\"font-heading text-xl font-bold")
    if pos != -1:
        # insert equivalent HTML
        html_block = f'''
  <Stack class="bg-zinc-100/50 dark:bg-white/5 p-4 rounded-lg my-6">
    <Text class="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Equivalent HTML output</Text>
    <Stack class="font-mono text-[0.75rem] text-zinc-700 dark:text-zinc-300">
      <Text style="white-space: pre-wrap;">{item["html"]}</Text>
    </Stack>
  </Stack>
'''
        # insert before the next section
        new_content = content[:pos+9] + html_block + content[pos+9:]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)

print("HTML equivalents added.")
