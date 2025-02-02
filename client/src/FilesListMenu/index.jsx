import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import Box from "@mui/material/Box"
import * as muiColors from "@mui/material/colors"
import SidebarBoxContainer from "../SidebarBoxContainer"
import CollectionsIcon from "@mui/icons-material/Collections"
import capitalize from "lodash/capitalize"
import classnames from "classnames"
import Checkbox from "@mui/material/Checkbox"
import getActiveImage from "../Annotator/reducers/get-active-image"
import { useTranslation } from "react-i18next"
import Tooltip from "@mui/material/Tooltip"

const theme = createTheme()
const LabelContainer = styled("div")(({ theme }) => ({
  display: "flex",
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 16,
  paddingRight: 16,
  alignItems: "center",
  cursor: "pointer",
  opacity: 0.7,
  // backgroundColor: "#fff",
  "&:hover": {
    opacity: 1,
  },
  "&.selected": {
    opacity: 1,
    fontWeight: "bold",
  },
}))
const Circle = styled("div")(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: 12,
  marginRight: 8,
}))
const Label = styled("div")(({ theme }) => ({
  fontSize: 11,
  marginLeft: 2,
}))
const DashSep = styled("div")(({ theme }) => ({
  flexGrow: 1,
  borderBottom: `2px dotted ${muiColors.grey[300]}`,
  marginLeft: 8,
  marginRight: 8,
}))
const Number = styled("div")(({ theme }) => ({
  fontSize: 11,
  textAlign: "center",
  minWidth: 14,
  paddingTop: 2,
  paddingBottom: 2,
  fontWeight: "bold",
  color: muiColors.grey[700],
}))

export const FilesListMenu = ({
  state,
  selectedImage,
  allImages,
  onSelectJump,
  onSelectFile,
  saveActiveImage,
  onClick,
}) => {
  const { t } = useTranslation()

  // Track the index of the selected image
  const [selectedIndex, setSelectedIndex] = useState(
    allImages.findIndex((img) => img.name === selectedImage) || 0
  );

  // Handle ArrowUp and ArrowDown key presses for navigation
  const handleKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : allImages.length - 1
      );
    } else if (event.key === "ArrowDown") {
      setSelectedIndex((prevIndex) =>
        prevIndex < allImages.length - 1 ? prevIndex + 1 : 0
      );
    }
  };

  // Add keydown event listener when the component mounts
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Update selected image when selectedIndex changes
  useEffect(() => {
    if (allImages[selectedIndex]) {
      onSelectJump(allImages[selectedIndex].name);
    }
  }, [selectedIndex]);


  const handleClickLabel = (label) => {
    onClick(getActiveImage(state))
    onSelectJump(label)
  }

  const handleCheckBoxClick = (image) => {
    onSelectFile(!image.selected)
  }

  const hasRegions = (imageIndex) => {
    return allImages?.length > 0 && allImages[imageIndex].regions?.length > 0
  }

  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title={`${t("menu.images")} [${allImages.length > 0 ? allImages.length : 0}]`}
        subTitle=""
        icon={<CollectionsIcon style={{ color: muiColors.grey[700] }} />}
        noScroll={true}
        expandedByDefault
      >
        {allImages.map((image, index) => (
          <LabelContainer
            className={classnames({ selected: image.name === selectedImage })}
            key={index}
          >
            <Tooltip title={t("download_checkbox_select")} placement="left">
              <Checkbox
                sx={{
                  padding: 0,
                  "& .MuiSvgIcon-root": {
                    fontSize: 14, // Set size
                    color: image.processed ? "green" : "#1976d2", // Set color conditionally
                  },
                  cursor:
                    selectedImage !== null && selectedImage !== index
                      ? "not-allowed"
                      : "pointer",
                   "&.Mui-disabled": {
                        background: !hasRegions(index) ? muiColors.grey[400] : "auto",
                        cursor: "not-allowed",
                        borderRadius: 0,
                        width: 14,
                        height: 14,
                      },
                }}
                checked={image.selected}
                onClick={() => handleCheckBoxClick(image, index)}
                data-testid="checkbox"
                disabled={
                  (selectedImage !== null && selectedImage !== index) ||
                  !hasRegions(index)
                }
              />
            </Tooltip>
            <span
              style={
                index === selectedImage
                  ? { backgroundColor: "rgba(255, 124, 120, 0.5)" }
                  : {}
              }
            >
              <Label
                className={classnames({
                  selected: image.name === selectedImage,
                })}
                style={{ backgroundColor: "withe" }}
                onClick={() => {
                  handleClickLabel(image.name)
                }}
              >
                {capitalize(image.name)}
              </Label>
            </span>
          </LabelContainer>
        ))}

        <Box pb={2} />
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

export default FilesListMenu
