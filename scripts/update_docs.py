import os
import re

src_dir = r"c:\Users\user\OneDrive\Desktop\WORK\omni-js\docs\src"

tutorial_files = [
    "Tutorial1.omni", "Tutorial2.omni", "Tutorial3.omni", "TutorialMedia.omni",
    "TutorialForm.omni", "Tutorial4.omni", "Tutorial5.omni", "Tutorial6.omni",
    "Tutorial7.omni", "TutorialCSS.omni", "TutorialAnimation.omni", "TutorialTodo.omni"
]

deep_dive_files = [
    "BlockStack.omni", "BlockText.omni", "BlockAction.omni", "BlockForm.omni",
    "BlockCollection.omni", "BlockMedia.omni", "BlockUse.omni"
]

all_files = tutorial_files + deep_dive_files

# Map routes
routes = {
    "Tutorial1.omni": "/tutorial/1",
    "Tutorial2.omni": "/tutorial/2",
    "Tutorial3.omni": "/tutorial/3",
    "TutorialMedia.omni": "/tutorial/media",
    "TutorialForm.omni": "/tutorial/form",
    "Tutorial4.omni": "/tutorial/4",
    "Tutorial5.omni": "/tutorial/5",
    "Tutorial6.omni": "/tutorial/6",
    "Tutorial7.omni": "/tutorial/7",
    "TutorialCSS.omni": "/tutorial/css",
    "TutorialAnimation.omni": "/tutorial/animation",
    "TutorialTodo.omni": "/tutorial/todo",
    "BlockStack.omni": "/block/stack",
    "BlockText.omni": "/block/text",
    "BlockAction.omni": "/block/action",
    "BlockForm.omni": "/block/form",
    "BlockCollection.omni": "/block/collection",
    "BlockMedia.omni": "/block/media",
    "BlockUse.omni": "/block/use"
}

def add_navigation(files):
    for i, file in enumerate(files):
        path = os.path.join(src_dir, file)
        if not os.path.exists(path):
            continue
            
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if already has navigation
        if '<Stack class="flex justify-between items-center mt-16' in content:
            # We already have navigation, let's update it or skip
            continue
            
        prev_route = routes[files[i-1]] if i > 0 else ("/" if "Tutorial" in file else "/blocks")
        next_route = routes[files[i+1]] if i < len(files)-1 else ("/" if "Tutorial" in file else "/")
        
        nav_block = f'''
  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="{prev_route}">&larr; Previous</Action>
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="{next_route}">Next &rarr;</Action>
  </Stack>
'''
        # Insert before closing </Stack>
        # Find the last </Stack>
        pos = content.rfind('</Stack>')
        if pos != -1:
            new_content = content[:pos] + nav_block + content[pos:]
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)

add_navigation(tutorial_files)
add_navigation(deep_dive_files)

# Remove GSAP from Home.omni
home_path = os.path.join(src_dir, "Home.omni")
if os.path.exists(home_path):
    with open(home_path, 'r', encoding='utf-8') as f:
        home_content = f.read()
    
    # Remove script block completely
    home_content = re.sub(r'<script>.*?</script>', '', home_content, flags=re.DOTALL)
    
    # Add animate-load to feature-cards
    delays = [0, 0.15, 0.3, 0.45]
    def repl(m):
        d = delays.pop(0) if delays else 0
        return m.group(0) + f' animate-load="from: {{ opacity: 0, y: 40, rotationX: -15, duration: 0.8, ease: \'back.out(1.2)\', delay: {d} }}"'
        
    home_content = re.sub(r'<Stack class="feature-card[^"]*"', repl, home_content)
    
    with open(home_path, 'w', encoding='utf-8') as f:
        f.write(home_content)

# Remove GSAP from Blocks.omni
blocks_path = os.path.join(src_dir, "Blocks.omni")
if os.path.exists(blocks_path):
    with open(blocks_path, 'r', encoding='utf-8') as f:
        blocks_content = f.read()
    
    # Remove script block completely
    blocks_content = re.sub(r'<script>.*?</script>', '', blocks_content, flags=re.DOTALL)
    
    # Add animate-load to block-cards
    b_delays = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
    def b_repl(m):
        d = b_delays.pop(0) if b_delays else 0
        return m.group(0) + f' animate-load="from: {{ opacity: 0, y: 40, rotationX: -15, duration: 0.8, ease: \'back.out(1.2)\', delay: {d} }}"'
        
    blocks_content = re.sub(r'<Stack class="block-card[^"]*"', b_repl, blocks_content)
    
    with open(blocks_path, 'w', encoding='utf-8') as f:
        f.write(blocks_content)

print("Updates applied.")
