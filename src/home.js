import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

import { makeStyles, withStyles } from "@material-ui/core/styles";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Container,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Grid,
  TableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Paper,
} from "@material-ui/core";

import { DropzoneArea } from "material-ui-dropzone";
import ClearIcon from "@material-ui/icons/Clear";

import image from "./bg.png";
import cblogo from "./cblogo.png.png";

/* ---------------- BUTTON ---------------- */
const ColorButton = withStyles(() => ({
  root: {
    color: "#000",
    backgroundColor: "#fff",
    "&:hover": {
      backgroundColor: "#f2f2f2",
    },
  },
}))(Button);

/* ---------------- STYLES ---------------- */
const useStyles = makeStyles(() => ({
  grow: { flexGrow: 1 },

  mainContainer: {
    backgroundImage: `url(${image})`,
    backgroundSize: "cover",
    height: "93vh",
    marginTop: "8px",
  },

  imageCard: {
    margin: "auto",
    maxWidth: 400,
    height: 500,
    backgroundColor: "transparent",
    borderRadius: "15px",
  },

  imageCardEmpty: {
    height: "auto",
  },

  media: {
    height: 400,
  },

  detail: {
    background: "white",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
  },

  clearButton: {
    width: "100%",
    padding: "12px",
    fontWeight: "bold",
  },

  appbar: {
    background: "#be6a77",
  },
}));

/* ---------------- COMPONENT ---------------- */
export const ImageUpload = () => {
  const classes = useStyles();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [image, setImage] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  let confidence = 0;

  /* ---------------- BASE64 + API CALL ---------------- */
  const sendFile = useCallback(async (file) => {
    if (!file) return;

    try {
      setIsloading(true);

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () =>
          resolve(reader.result.split(",")[1]);

        reader.onerror = reject;
      });

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}`,
        {
          image_base64: base64,
        }
      );

      if (res.status === 200) {
        setData(res.data);
      }
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setIsloading(false);
    }
  }, []);

  /* ---------------- FILE SELECT ---------------- */
  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(null);
      setImage(false);
      setData(null);
      return;
    }

    setSelectedFile(files[0]);
    setImage(true);
  };

  /* ---------------- PREVIEW ---------------- */
  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  /* ---------------- API TRIGGER ---------------- */
  useEffect(() => {
    if (selectedFile) {
      sendFile(selectedFile);
    }
  }, [selectedFile, sendFile]);

  /* ---------------- CLEAR ---------------- */
  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  /* ---------------- CONFIDENCE ---------------- */
  if (data) {
    confidence = (parseFloat(data.confidence) * 100).toFixed(2);
  }

  return (
    <>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography variant="h6">
            Potato Disease Classification
          </Typography>
          <div className={classes.grow} />
          <Avatar src={cblogo} />
        </Toolbar>
      </AppBar>

      <Container className={classes.mainContainer} maxWidth={false}>
        <Grid container justifyContent="center" spacing={2}>

          <Grid item xs={12}>
            <Card className={`${classes.imageCard} ${!image && classes.imageCardEmpty}`}>

              {image && preview && (
                <CardActionArea>
                  <CardMedia className={classes.media} image={preview} />
                </CardActionArea>
              )}

              {!image && (
                <CardContent>
                  <DropzoneArea
                    acceptedFiles={["image/*"]}
                    dropzoneText="Upload potato leaf image"
                    onChange={onSelectFile}
                  />
                </CardContent>
              )}

              {isLoading && (
                <CardContent className={classes.detail}>
                  <CircularProgress />
                  <Typography>Processing...</Typography>
                </CardContent>
              )}

              {data && (
                <CardContent className={classes.detail}>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Label</TableCell>
                          <TableCell align="right">Confidence</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{data.class_}</TableCell>
                          <TableCell align="right">
                            {confidence}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}

            </Card>
          </Grid>

          {data && (
            <Grid item xs={12} style={{ maxWidth: 400 }}>
              <ColorButton
                onClick={clearData}
                startIcon={<ClearIcon />}
                className={classes.clearButton}
              >
                Clear
              </ColorButton>
            </Grid>
          )}

        </Grid>
      </Container>
    </>
  );
};
