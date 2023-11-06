import pandas as pd

'''
# data download from
https://www.fao.org/faostat/en/#data/QCL/visualize
# extract only rice yield
head -1 Production_Crops_Livestock_E_Asia.csv > Rice_Yield_Asia.csv
grep '"Rice"' Production_Crops_Livestock_E_Asia.csv | grep '"Yield"' >> Rice_Yield_Asia.csv
'''

df = pd.read_csv('Rice_Yield_Asia.csv')
df_area = pd.read_csv('FAOSTAT_data_11-6-2023.csv')


df = df.merge(df_area, left_on="Area Code", right_on="Country Code")

required_field = ['ISO2 Code', 'Area']
for year in range (1961, 2022):
    required_field.append(f'Y{year}')


df.to_csv('output.csv', columns=required_field, index=False)
