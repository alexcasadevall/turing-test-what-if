import pandas as pd

df = pd.read_csv('results_pretest.csv')

def separar_variables_qualtrics(text_cru):
    if pd.isna(text_cru):
        return pd.Series(dtype=object)
    
    diccionari = {}
    posts = text_cru.split(';')
    
    for post in posts:
        variables = post.split('|')
        for var in variables:
            if '=' in var:
                clau, valor = var.split('=', 1)
                diccionari[clau.strip()] = valor.strip()
                
    return pd.Series(diccionari)

df_turing = df['embedded_data_turing'].apply(separar_variables_qualtrics)
df_mdgrnd = df['embedded_data_mdgrnd'].apply(separar_variables_qualtrics)

noves_columnes = list(df_turing.columns) + list(df_mdgrnd.columns)

columnes_a_esborrar = [col for col in noves_columnes if col in df.columns]
if columnes_a_esborrar:
    df.drop(columns=columnes_a_esborrar, inplace=True)

df_final = pd.concat([df, df_turing, df_mdgrnd], axis=1)

df_final.to_csv('clean_pretest_results.csv', index=False)

print("Procés completat! S'ha generat el fitxer 'clean_pretest_results.csv' net i sense duplicitats.")