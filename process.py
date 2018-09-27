import pandas as pd
import json
import math
import hashlib, binascii
import numpy as np
import time
from shutil import copyfile
from os import listdir
import re

# Hash Data
oldColumns=['date','item','debit','credit','subCategory','hash', 'account']
addedColumns = ['date','item','debit','credit','hash','account']
newColumns=['date','item','debit','credit','card']
processedColumns=['item','category','subCategory','date','year','month','debit','credit','balance', 'account']

def hashit(df):
    hashs = []
    for index, row in df.iterrows():
        h = hashlib.new('ripemd160')
        it = str(row['item'])
        it2= ' '.join(re.findall(r"[\w']+", it))
        h.update(it2.encode())
        h.update(str(row['credit']).encode())
        h.update(str(row['debit']).encode())
        h.update(str(row['date']).encode())
        hashed =h.hexdigest()
        hashs.append(hashed)
    return hashs

def getFile(file):
    if file == "data":
        return pd.read_csv("./processed/data.csv", header=None, names=oldColumns,index_col=False)
    elif file == "processed":
        return pd.read_csv("./processed/processed.csv",index_col=False)
    elif file == "maps":
        return pd.read_csv("./rules/1to1maps.csv", header=None, names=['item', 'subCategory'])
    elif file == "subCategories":
        return pd.read_csv("./rules/categories.csv", header=None, names=['item', 'subCategory'])
    elif file == "categories":
        return pd.read_csv("./rules/breakdown.csv", header=None, names=['subCategory', 'category'])


def testDf(df):
    assert df.dtypes['debit'] == 'float64'
    assert df.dtypes['credit'] == 'float64'

def fixDf(df):
    global oldColumns
    df['subCategory'].fillna("",inplace=True)
    df=df[oldColumns]
    return df

def saveDf(df, fileName, path, header):
    miliTime = int(round(time.time() * 1000))
    df.to_csv(f'./backup/{fileName}-{str(miliTime)}.csv', index=False, header=header)
    df.to_csv(f'./{path}/{fileName}.csv', index=False, header=header)    
    
def findNewItems(old, new, fileName):
    new['hash']= hashit(new)
    hashfound = []
    for index, row in new.iterrows():
        hashfound.append(row['hash'] in old['hash'].values)
    new['hashfound']=hashfound
    new.loc[new['hashfound'] == False, 'account'] = fileName;
    newItems = new[new['hashfound'] == False]
    return newItems

def writeToJson(df):
    gooddata = df
    items = []
    for index, row in gooddata.iterrows():
        temp = {}
        for key in row.keys():
            temp[key] = row[key]
        items.append(temp)
    with open('analysis/js/data.json', 'w') as jsonFile:
        json.dump(items, jsonFile)

def hashData():
    global oldColumns
    dlFiles = listdir("./download")
    try:
        dlFiles.remove('.DS_Store')
    except:
        pass

    old = getFile('data')
    old['subCategory'].fillna("",inplace=True)
    old.fillna(value=0,inplace=True)
    testDf(old)

    combinedAll = old[oldColumns]
    combinedNew = pd.DataFrame(columns=oldColumns)

    for file in dlFiles:
        new = pd.read_csv("./download/"+file, header=None, names=newColumns)
        new.fillna(value=0,inplace=True)
        testDf(new)

        newItems = findNewItems(combinedAll, new, file.split(".")[0])
        newToSave = newItems[addedColumns]

        print(f"{file} - {len(newToSave)} new items found")

        combinedAll = pd.concat([combinedAll, newToSave])
        combinedNew = pd.concat([combinedNew, newToSave])
        
    combinedNew = fixDf(combinedNew)
    return combinedNew

# Process Hashed Data
def processData(newItems,doAll = False):
    if doAll:
        data = getFile('data')
    else:
        newItems.reset_index(inplace=True)
        data = newItems.copy()

    maps = getFile('maps')
    subCategories = getFile('subCategories')
    categories = getFile('categories')

    categoryMap ={}
    for i, row in categories.iterrows():
        categoryMap[row['subCategory']] = row['category']

    data.fillna("", inplace=True)

    subCatArray = []
    # first mapping the 1to1 mappings
    for i, row in data.iterrows():
        if (row['subCategory'] != ""):
            subCatArray.append(row['subCategory'])
        else:
            try:
                index = pd.Index(maps['item']).get_loc(row['item'].rstrip())
                subCategory = maps.loc[index]['subCategory']
                subCatArray.append(subCategory)
            except:
                subCatArray.append("")

    # then mapping all the general categories
    data['subCategory'] = subCatArray
    subCatArray = pd.Series(subCatArray) 


    for i, categoryRow in subCategories.iloc[::-1].iterrows():
        indo = ((data['item'].str.contains(categoryRow['item'])) & (data['subCategory']==""))
        subCatArray[indo] = categoryRow['subCategory']

    data['balance']=data['credit']-data['debit']

    # finally taking care of special categories with logic
    specialCategories = subCategories[subCategories['item'].str.contains('{{')]
    for i, categoryRow in specialCategories.iterrows():
        itemValuePair = categoryRow['item'].replace('}}', '').split('{{')
        indo = (data['item'].str.contains(itemValuePair[0].rstrip()) & (data['balance']==(float(itemValuePair[1]))))
        subCatArray[indo] = categoryRow['subCategory']

    data['subCategory'] = subCatArray
    data['category'] = data['subCategory'].map(categoryMap)
    data['year']= pd.to_datetime(data['date']).dt.year
    data['month']= pd.to_datetime(data['date']).dt.month

    return data
    
def resetToCurrentData():
    processedData = processData(None, True)  
    processedToSave = processedData[processedColumns].sort_values(by='date', ascending=False)
    saveDf(processedToSave, 'processed', 'processed', True)

def runProcess():
    newItems = hashData()
    if(newItems['item'].count() > 0):
        processedData = processData(newItems)   
        dataWithoutCategory = (processedData[processedData['subCategory'] == ""])
        if(len(dataWithoutCategory) == 0):
            processedAlready = getFile('processed')
            processedAll = pd.concat([processedData, processedAlready])
            processedToSave = processedAll[processedColumns].sort_values(by='date', ascending=False)
            saveDf(processedToSave, 'processed', 'processed', True)

            dataAll = getFile('data')
            combinedData = pd.concat([dataAll, newItems])
            combinedData = combinedData[oldColumns]
            saveDf(combinedData, 'data', 'processed', False)

            writeToJson(processedToSave)

            print("SAVED")
        else:
            print('Found Gaps, NOT SAVED')
            print(dataWithoutCategory[['item','date','balance']])
    #       dataWithoutCategory[['item','date','balance']].to_csv('./processed/not_found.csv')
    else:
        print('no new items')
        
runProcess()