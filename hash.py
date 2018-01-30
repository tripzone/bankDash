
import pandas as pd
import hashlib, binascii
import numpy as np
import time
from shutil import copyfile
from os import listdir

def hashit(df):
    hashs = []
    for index, row in df.iterrows():
        h = hashlib.new('ripemd160')
#         h.update(row['item'].encode())
        h.update(str(row['credit']).encode())
        h.update(str(row['debit']).encode())
        h.update(str(row['date']).encode())
        hashed =h.hexdigest()
        hashs.append(hashed)
    return hashs

def combineThem (old, new, file):
    old['custom'].fillna("",inplace=True)
    old.fillna(value=0,inplace=True)
    new.fillna(value=0,inplace=True)
    assert new.dtypes['debit'] == 'float64'
    assert new.dtypes['credit'] == 'float64'
    assert old.dtypes['debit'] == 'float64'
    assert old.dtypes['credit'] == 'float64'
    new['hash']= hashit(new)
    old['hash']= hashit(old)
    hashfound = []
    for index, row in new.iterrows():
        hashfound.append(row['hash'] in old['hash'].values)
    new['hashfound']=hashfound
    newItems = new[new['hashfound'] == False]
    oldToSave = old[oldColumns]
    newToSave = newItems[['date','item','debit','credit']]
    combined = pd.concat([oldToSave, newToSave])
    combined['custom'].fillna("",inplace=True)
    try:
        head = newItems['date'].sort_values().head(1).values[0]
        tail = newItems['date'].sort_values().tail(1).values[0]
    except:
        head = 0;
        tail = 0;
    if( head == 0 ):
        print(f"{file} - {len(newItems)} new items added")
    else:
        print(f"{file} - {len(newItems)} new items added, ranging from {head} to {tail}")
    return combined[oldColumns]

dlFiles = listdir("./download")
try:
    dlFiles.remove('.DS_Store')
except:
    pass

# Save files to their respective counterpart , e.g visa.csv, debit.csv etc
miliTime = int(round(time.time() * 1000))
oldColumns=['date','item','debit','credit','custom']
newColumns=['date','item','debit','credit','card']
for file in dlFiles:
    old = pd.read_csv("./assets/"+file, header=None,names=oldColumns)
    new = pd.read_csv("./download/"+file, header=None, names=newColumns)
    combined = combineThem(old, new, file)
    combined.to_csv(f'./assets/backup/{file.split(".")[0]}-{str(miliTime)}.{file.split(".")[1]}', index=False, header=False)
    combined.to_csv(f'./assets/{file}', index=False, header=False)
    
# aggregate everything in a data.csv file
old = pd.read_csv("./assets/data.csv", header=None,names=oldColumns)
combined = old
for file in dlFiles:
    new = pd.read_csv("./download/"+file, header=None, names=newColumns)
    combined = combineThem(combined, new, file)
combined.to_csv(f'./assets/backup/data-{str(miliTime)}.csv', index=False, header=False)
combined.to_csv(f'./assets/data.csv', index=False, header=False)

