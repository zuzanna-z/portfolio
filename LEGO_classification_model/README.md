# LEGO brick classification task: Image classification with convolution network 

This project compares the performance of a basic CNN classifier trained only on training data and a pretrained (VGG16) CNN to classify LEGO blocks by type. 

The dataset for this project can be found [here](https://www.kaggle.com/datasets/pacogarciam3/lego-brick-sorting-image-recognition) (Garcia, 2026). The data consists of over 4500 images of different LEGO bricks (20 different categories) in two versions: cropped and uncropped.

In this project:
The LEGO brick images are split into three subsets: train and test sets in 4 to 1 ratio (the split is random, done using numpy package). From the training set, a portion of the images is then reserved for the validation set. All the images are normalised and resized to 224x224 standard size. The data is then fed into the basic CNN and the model using pretrained VGG16 (Simonyan & Zisserman, 2015). 

## Project structure:

The in folder contains the test and train data.
```
in
|_test
    |_[Brick+1x1 ... Plate_2x4]
|_train
    |_[Brick+1x1 ... Plate_2x4]
```

The output folder contains the classification results for both models as well as a "fig" subfolder storing the training and validation loss curve plots. 
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
    # contains functions necessary for building, training and testing the CNN classifier

    cnn_classifier.py 

    # contains all the steps to load in and split the data for the "in" folder
    data_load.py

    # contains all of the steps for loading in the images
    data_setup.py
    
    # runs the pipeline
    main.py

    # contains functions necessary for loss and validation curve plotting
    plot_fig.py

    # contains functions necessary for loading, training and testing the  VGG16 classifier
    vgg16_classifier.py
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

This project requires python 3.10 - 11,the setup structure in this project is built for the Linux terminal environment, however the requirements.txt can be reused to build a virtual environment on a different system. In order to run this code, you must first download the data from the link above then do the following:

```
bash setup.sh

source ./env/bin/activate
```

BEFORE YOU RUN THE MAIN.PY FILE: 

Be mindful that this setup requires a specific data folder architecture:

```
in
|_test
    |_[Brick+1x1 ... Plate_2x4]
|_train
    |_[Brick+1x1 ... Plate_2x4]
```
IF YOUR "IN" FOLDER IS EMPTY OR IS SET UP IN ANY OTHER WAY, PLEASE READ THE INSTRUCTIONS BELOW:

You must provide a path to your lego data folder (which you previously downloaded from the provided link) as input when running the main.py file. The downloaded data should contain two subfolders: "base" and "cropped". You may use either of the two subfolders, however the following analysis was run on the data in the "cropped" folder.
YOU MUST PROVIDE A PATH TO ONLY ONE OF THE SUBFOLDERS (e.g. "downloads/data/lego/base" or "downloads/data/lego/cropped" - use path structure compatible with your system and file setup). The "in" folder will be then set up automatically. If you do have train and test subfolders in your "in" folder, that follow the structure outlined above you simply put "y" as your input. If your "in" folder isn't empty but the structure is not the same as the one outlined above, delete all of the files in the folder and set it up anew.

e.g. :
```
python src/main.py --input ".../cropped" / "y"
```

## Results 
The CNN trained directly on the data attains f1 score of around 0.4 (best = 0.83, worst = 0.04) after 10 epochs. It is likely that the network could reach a higher classification accuracy given a bigger dataset and more hidden layers. On the other hand the pretrained model reaches f1 score above 0.7 (best = 0.99, worst = 0.27) with only 5 epochs vastly outperforming the basic CNN.

1. **CNN model**

| | precision|    recall|  f1-score|   support|
|-|-|-|-|-|
|        accuracy |       |      | 0.36 | 905|
|       macro avg |  0.57 | 0.37 | 0.37 | 905|
|    weighted avg |  0.60 | 0.36 | 0.37 | 905|

2. **VGG16 model**

| | precision|    recall|  f1-score|   support|
|-|-|-|-|-|
|        accuracy |       |      | 0.70 | 905|
|       macro avg | 0.71 | 0.69 | 0.69 | 905|
|    weighted avg |  0.71 | 0.70 | 0.69 | 905|

## Discussion
Looking at the results of both models, it is clear to see that the transfer learning greatly improves the model's performance. Most interestingly the model utilising the pretrained VGG16 network reaches a much higher accuracy with half the epochs of the basic CNN model, proving that using a transfer learning for this type of task can compensate for drawbacks such as  short training time. The model utilising VGG16 in this case had an advantage of layers trained on millions of images. However, while freezing the layers of the VGG16 model makes the training more efficient, faster and less computationally expensive, it may limit the models performance.

## Limitations
As mentioned in the discussion, transfer learning as seen in the VGG16 model is a resource efficient way to improve the models performance. However, while the frozen layers are less computationally demanding the pretrained features may not align up perfectly with the dataset at hand making it difficult for the model to improve. Moreover, due to resource restraints in this project the CNN model trains on 10 iterations while the VGG16 model trains on only 5 iterations, it is very plausible that both models could improve with longer training. Another consideration could be made about the data augmentation, that would provide the model with a greater variety of features. Lastly, the construction of the models is also important to consider, the models used in this analysis are quite small, adding more layers could improve the performance for both models.  

## References
Garcia, F. (2026). Lego Brick Sorting—Image Recognition [Dataset].
Simonyan, K., & Zisserman, A. (2015). Very Deep Convolutional Networks for Large-Scale Image Recognition.