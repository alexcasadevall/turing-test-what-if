import os
import json
import glob
import random

def main():
    ficticis_dir = "/Users/alexcasadevall/Documents/FEINA/Projecte Incivilitat/ONLINEHATE/Turing Test/turing-test-what-if/ficticis"
    noms_pool = [
        "Miguel", "Helena", "Alex", "Juan", "Paula", "Clara", "Marc", "Sílvia", "Dani", "Lucía",
        "Sergi", "Carla", "Adrià", "Marta", "Jordi", "Núria", "Pau", "Laia", "Oriol", "Emma",
        "Pol", "Júlia", "Víctor", "Irene", "Albert", "Marina", "Gerard", "Alba", "Oscar", "Sònia",
        "Roger", "Berta", "Xavi", "Anna", "Lluís", "Sara", "Mateu", "Elena", "Ivan", "Noa",
        "Raül", "Queralt", "Eloi", "Aina", "Hugo", "Èric", "Vila", "Nil", "Mar", "Ismael",
        "Biel", "Neus", "Enric", "Clàudia", "Ignasi", "Ivet", "Ramon", "Gisela", "Cesc", "Isona"
    ]
    
    # Find all json files in fictitious folder
    json_files = glob.glob(os.path.join(ficticis_dir, "**", "*.json"), recursive=True)
    
    # Group files by filename (e.g. clim_2.json)
    files_by_name = {}
    for path in json_files:
        filename = os.path.basename(path)
        if filename not in files_by_name:
            files_by_name[filename] = []
        files_by_name[filename].append(path)
        
    for filename, paths in sorted(files_by_name.items()):
        # Sort paths so that folder with largest length (e.g. '30') is first
        def get_length(p):
            parts = p.split(os.sep)
            # Find the component that is a number (e.g., 30, 16, 8)
            for part in reversed(parts):
                if part.isdigit():
                    return int(part)
            return 0
            
        sorted_paths = sorted(paths, key=get_length, reverse=True)
        longest_path = sorted_paths[0]
        
        # Read the longest file to build the user mapping
        with open(longest_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        messages = data.get("messages", [])
        
        # Build mapping for unique senders encountered in the messages
        unique_senders = []
        for msg in messages:
            sender = msg.get("sender")
            if sender and sender not in unique_senders:
                unique_senders.append(sender)
                
        # Seed a random generator with the filename to make it vary between
        # conversations, yet remain completely stable and reproducible.
        rng = random.Random(filename)
        shuffled_pool = noms_pool.copy()
        rng.shuffle(shuffled_pool)
        
        user_mapping = {}
        for i, sender in enumerate(unique_senders):
            user_mapping[sender] = shuffled_pool[i % len(shuffled_pool)]
            
        print(f"Mapping for {filename}:")
        for orig, mapped in user_mapping.items():
            print(f"  {orig} -> {mapped}")
            
        # Apply the mapping to all versions (lengths) of this conversation
        for path in sorted_paths:
            with open(path, 'r', encoding='utf-8') as f:
                p_data = json.load(f)
                
            p_messages = p_data.get("messages", [])
            for msg in p_messages:
                # Map sender
                orig_sender = msg.get("sender")
                if orig_sender in user_mapping:
                    msg["sender"] = user_mapping[orig_sender]
                
                # Map reply_to
                orig_reply_to = msg.get("reply_to")
                if orig_reply_to and orig_reply_to in user_mapping:
                    msg["reply_to"] = user_mapping[orig_reply_to]
                    
            # Write the modified JSON back to its path
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(p_data, f, indent=4, ensure_ascii=False)
            print(f"  ✅ Updated: {path}")

if __name__ == "__main__":
    main()
