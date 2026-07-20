import os
import matplotlib.pyplot as plt

# setting up paths
SRC_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SRC_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "in")
OUT_DIR = os.path.join(PROJECT_DIR, "out")

# this function plots the percentage of face containing pages
def plot_count(df, fig_path):
    plt.figure(figsize=(12,6))

    # the function can plot both one single dataframe and multiple separate dataframes
    if isinstance(df, list):
        for i in df:
        # plotting the page ratio per newspaper
            plt.plot(i.index, i["face_count_percentage"], label=i["newspaper"].iloc[0])
    else:
        # plotting the page ratio per newspaper
        plt.plot(df.index, df["face_count_percentage"], label=df["newspaper"].iloc[0]) 

    plt.title("Change in percantage of newspaper pages containing faces by decade")
    plt.xlabel("Decade") 
    plt.ylabel("Percentage of pages containing faces")
    plt.tight_layout()
    plt.legend()
    # saving the plot
    plt.savefig(fig_path)
    plt.show() 

if __name__ == "__main__":
    plot_count()