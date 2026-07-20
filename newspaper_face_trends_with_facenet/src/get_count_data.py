import os
import pandas as pd

# setting up paths
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "in")
OUT_DIR = os.path.join(PROJECT_DIR, "out")

# this function gathers all page metrics by decade
def create_decade_wise_df(df, newspaper):
    # 1. a new row is created in the raw page face count, if the page contains at least one face = 1, otherwise = 0
    df["page_contains_face"] = [1 if page > 0 else 0 for page in df["count"]]

    # the newly created column is summed by decade, resulting in the exact count of pages containing faces for each decade
    df_decade = pd.DataFrame(df.groupby(['decade'])['page_contains_face'].sum())

    # calculating the number of all pages per decade
    df_decade_count = pd.DataFrame(df.groupby(['decade']).size())

    # calculating the percentage of pages containing faces for each decade
    df_decade["face_count_percentage"] = df_decade["page_contains_face"]/df_decade_count[0]

    # calculating the total face count for each decade
    df_decade["total_face_count"] = [sum(df["count"][df["decade"]==decade]) for decade in df_decade.index]

    # adding the newspaper label
    df_decade["newspaper"] = newspaper

    # saving the data as csv file
    file_path = newspaper + "_data.csv"
    df_decade.to_csv(os.path.join(OUT_DIR, file_path))
    
    return df_decade
    

if __name__ == "__main__":
    create_decade_wise_df()
