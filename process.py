import pandas as pd
import json

data = pd.read_csv("./assets/data.csv", header=None, names=['date','item', 'debit', 'credit','subCategory', 'hash', 'account'],index_col=False)
maps = pd.read_csv("./rules/1to1maps.csv", header=None, names=['item', 'subCategory'])
subCategories = pd.read_csv("./rules/categories.csv", header=None, names=['item', 'subCategory'])
categories = pd.read_csv("./rules/breakdown.csv", header=None, names=['subCategory', 'category'])

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

dataWithCategory = (data[data['subCategory'] != ""])
dataWithoutCategory = (data[data['subCategory'] == ""])
dataWithCategory[['item','category','subCategory','date','year','month','debit','credit','balance']].sort_values(by='date', ascending=False).to_csv('./processed/processed.csv', index=False)
dataWithoutCategory[['item','date','balance']].to_csv('./processed/not_found.csv')

gooddata = pd.read_csv("./processed/processed.csv")
items = []
for index, row in gooddata.iterrows():
    temp = {}
    for key in row.keys():
        temp[key] = row[key]
    items.append(temp)
with open('processed/js/data.json', 'w') as jsonFile:
    json.dump(items, jsonFile)

print(dataWithoutCategory[['item','date','balance']])
