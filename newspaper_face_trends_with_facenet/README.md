# Human presence in the news: Detecting faces & analysing trends in historical newspapers 

This project uses a pretrained MTCNN (Multi-task Cascaded Convolutional Networks) - a face detection framework from Pytorch library (Esler, 2019/2026), to calculate how the presence of faces in print changes by decade across three Swiss journals.

The data utilesed for this project can be found [here](https://zenodo.org/records/3706863?preview_file=images.zip). It is a set of over 4000 individual newspaper pages, spanning from 18th to 21st century across three Swiss journals: La Gazette de Lausanne, Journal de Genève and L'Impartial (Barman et al., 2021). 
The images for the analysis are preprocessed using the openCV package (Bradski, 2000).

In this project, for each newspaper:
Page by page all of the pages are read in and converted to gray scale to standardise the image input.
The MTCNN (with the default facenet-pytorch confidence thresholds) is used to detect faces on the page.
The number of faces and the percentage of pages containing any face is calculated per decade. 

## Project structure:

The in folder contains the newspaper data.
```
in
|_GDL
    |_[]
|_IMP
    |_[]
|_JDG
    |_[]
```

The output folder contains the face count percentages for all newspapers as well as a "fig" subfolder storing the plotted percentages per decade. 
```
out
|_fig
    |_[]
|_[]
```
The source folder contains all of the code files.

```python
src
|_[
    # contains all steps necessary to count face percentages per decade
    get_count_data.py 

    # contains functions necessary to detect faces and save the gathered data
    get_raw_data.py
    
    # runs the pipeline
    main.py

    # contains steps necessary to plot the face count 
    plot_count.py

]
```
```
README.md
```
The requirements.txt contains all the packages necessary to run this project
```
requirements.txt
```
The setup.sh creates the virtual environment for the project and downloads all the packages specified in requirements.txt
```
setup.sh
```

## Steps for analysis

This project requires python 3.10 - 11,the setup structure in this project is built for the Linux terminal environment, however the requirements.txt can be reused to build a virtual environment on a different system. In order to run this code, you must first download the data from the link above, then place the data in the "in" folder. Do make sure that your "in" folder is structured as follows:

```
in
|_GDL
    |_[GDL-1992-07-29-a-p0026.jpg...]
|_IMP
    |_[IMP-1992-07-29-a-p0026.jpg...]
|_JDG
    |_[JDG-1992-07-29-a-p0026.jpg...]
```

Then do the following:

```
bash setup.sh
```

Then do this:

```
source ./env/bin/activate
python src/main.py
```

## Results 
As can be seen in the image below the number of faces detected in the pages rises for all three newspapers, with the L'Impartial portraying the most human faces out of all the journals used.

![image](out\fig\face_count_change_across_years_for_all_journals_demo_.jpg)

However, there is a large variation in the trend as the percentage of the pages containing faces across decades keeps dropping and rising again. There was a particularly sharp rise in the late 1900s as compared to other decades, as well as a visible drop around the 1940s and 1970s. 



## Discussion & Limitations
This study gives a somewhat reliable overview of how representation of human faces changed in journals across decades. What is important to note is that this overview only considers the ratio of whether there is any face present on the page and how many faces are present in general without considering how many individual images with any faces are present in the journal or what the role of the image is. When it comes to the MTCNN itself, it can be considered quite reliable when it comes to modern photography. Studies such as Karamizadeh et al. 2025 and Wu & Zhang, 2021 show that even the base MTCNN as used in this example has a very high accuracy rate for face detection. However, the images in the datasets used vary in quality, with some images being corrupted and / or incomplete which might influence the face detection later on. Moreover, the image resolution as present in the newspaper pages itself must also be taken into account. As pointed out in Ömercikoğlu et al., 2025 poor image resolution might lead to lower accuracy rates in MTCNN. It must be considered that the quality of some images used, especially for the newspapers from the earliest decades, might be of poorer quality. The MTCNN might have underperformed on those images, inflating the idea that modern journalism includes more facial images. Considering the issue of the image quality variation in the dataset, assessing the network's performance becomes quite difficult. Disregarding the image quality, this analysis could be improved by accounting for the image role in the page as well as by controlling for the ratio of images containing faces to all images used in the newspapers.

## References 
Barman, R., Ehrmann, M., Clematide, S., Ares Oliveira, S., & Kaplan, F. (2021). Combining Visual and Textual Features for Semantic Segmentation of Historical Newspapers. 2021(Special Issue on HistoInformatics: Computational Approaches to History), 1–26. https://doi.org/10.5281/zenodo.4065271 
Bradski, G. (2000). The OpenCV library. In Dr. Dobb’s Journal (Vol. 25, Issue 11, pp. 120–125). Informa.
Esler, T. (2026). Timesler/facenet-pytorch [Python]. https://github.com/timesler/facenet-pytorch (Original work published 2019) 
Karamizadeh, S., Shojae Chaeikar, S., & Salarian, H. (2025). Combining MTCNN and Enhanced FaceNet with Adaptive Feature Fusion for Robust Face Recognition. Technologies, 13(10), 450. https://doi.org/10.3390/technologies13100450
Ömercikoğlu, A. C., Yönügül, M. M., & Erdoğmuş, P. (2025). The Impact of Image Resolution on Face Detection: A Comparative Analysis of MTCNN, YOLOv XI and YOLOv XII models. https://doi.org/10.48550/arxiv.2507.23341  
Wu, C., & Zhang, Y. (2021). MTCNN and FACENET Based Access Control System for Face Detection and Recognition. Automatic Control and Computer Sciences, 55(1), 102–112. https://doi.org/10.3103/S0146411621010090
