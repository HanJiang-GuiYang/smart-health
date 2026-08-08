filepath = r'c:\Users\HanJiang\Desktop\智慧健康\esp32\health_sensor\health_sensor.ino'

with open(filepath, 'rb') as f:
    raw = f.read()

# Search for the pattern in raw bytes
target = b'server.sendHeader("Cache-Control", "no-store");'
idx = raw.find(target)

if idx >= 0:
    print(f'Found at byte offset {idx}')
    # Show surrounding context
    print('Context:', repr(raw[idx:idx+120]))
    
    # Find the end of this line (next \n or \r\n)
    line_end = raw.find(b'\n', idx)
    if line_end < 0:
        line_end = len(raw)
    
    # Build the replacement
    cors_addition = b'\n  server.sendHeader("Access-Control-Allow-Origin", "*");\n  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");\n  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");'
    
    new_raw = raw[:line_end] + cors_addition + raw[line_end:]
    
    with open(filepath, 'wb') as f:
        f.write(new_raw)
    print('OK: CORS headers added!')
else:
    print('NOT FOUND')
