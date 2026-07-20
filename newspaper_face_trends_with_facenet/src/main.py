import os
import pandas as pd
from facenet_pytorch import MTCNN
from get_raw_data import get_raw_data
from get_count_data import create_decade_wise_df
from plot_count import plot_count

# setting up paths
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "in")
OUT_DIR = os.path.join(PROJECT_DIR, "out")

# loading in the MTCNN 
mtcnn = MTCNN(keep_all=True)

newspaper_list = ["GDL", "IMP", "JDG"]
dframes = []

# this loop runs for each newspaper
for newspaper in newspaper_list:
    print("running pipline for:", newspaper)
    # 1. the number of faces is calculated for each page
    df = get_raw_data(newspaper, mtcnn)
    print("raw data ready")
    # 2. the number of faces and the ratio of face containing pages is calculated by decade
    df_news = create_decade_wise_df(df, newspaper)
    print("count data ready")
    # this chunk gathers all of the df in one list for the combined plot
    dframes.append(df_news)
    # 3. the ratio of pages containing faces is ploted for each decade
    fig_file_path = newspaper + "_face_count_change_across_years.jpg"
    plot_count(df_news, os.path.join(OUT_DIR, "fig", fig_file_path))
    print(os.path.join(OUT_DIR, "fig", fig_file_path))

# this chunk concatonates all of the df into one for the combined plot
df = pd.concat(dframes)

# plotting the ratio of pages containing faces per decade for each newspaper
plot_count(dframes, os.path.join(OUT_DIR, "fig", "face_count_change_across_years_for_all_journals.jpg"))

