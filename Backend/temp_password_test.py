from app.utils.security import hash_password, verify_password

p = 'Ravi@123'
print('password:', p)
print('len chars:', len(p))
print('len bytes:', len(p.encode('utf-8')))
h = hash_password(p)
print('hash length:', len(h))
print('verify:', verify_password(p, h))
