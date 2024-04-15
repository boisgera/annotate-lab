// @flow

import { memo, useRef } from "react";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import styles from "./styles";
import classnames from "classnames";
import type { Region } from "../ImageCanvas/region-tools";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import TrashIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import TextField from "@mui/material/TextField";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import { asMutable } from "seamless-immutable";

const theme = createTheme();
const useStyles = makeStyles(styles);

type Props = {
  region: Region;
  editing?: boolean;
  allowedClasses?: Array<string> | Array<{ id: string; label: string }>;
  allowedTags?: Array<string>;
  cls?: string;
  tags?: Array<string>;
  onDelete: (r: Region) => void;
  onChange: (r: Region) => void;
  onClose?: (r: Region) => void;
  onOpen?: (r: Region) => void;
  onRegionClassAdded?: (v: string) => void;
  allowComments?: boolean;
};

export const RegionLabel = ({
  region,
  editing,
  allowedClasses,
  allowedTags,
  onDelete,
  onChange,
  onClose,
  onOpen,
  onRegionClassAdded,
  allowComments,
}: Props) => {
  const classes = useStyles();
  const commentInputRef = useRef<HTMLDivElement | null>(null);
  const onCommentInputClick = () => {
    // The TextField wraps the <input> tag with two divs
    const commentInput = commentInputRef.current?.children?.[0]
      ?.children?.[0] as HTMLInputElement | undefined;

    if (commentInput) return commentInput.focus();
  };

  const isCreatableAllowedClasses = typeof allowedClasses?.[0] === "string";
  const selectedRegionClass =
    allowedClasses?.find((c) => typeof c === "object" && c.id === region.cls) ||
    region.cls;
  const selectedLabel =
    selectedRegionClass && typeof selectedRegionClass === "object"
      ? selectedRegionClass.label
      : region.cls;
  const selectedValue =
    selectedRegionClass && typeof selectedRegionClass === "object"
      ? { label: selectedRegionClass.label, value: selectedRegionClass.id }
      : region.cls
      ? { label: region.cls, value: region.cls }
      : null;

  return (
    <ThemeProvider theme={theme}>
      <Paper
        onClick={() => (!editing && onOpen ? onOpen(region) : null)}
        className={classnames(classes.regionInfo, {
          highlighted: region.highlighted,
        })}
      >
        {!editing ? (
          <div>
            {region.cls && (
              <div className="name">
                <div
                  className="circle"
                  style={{ backgroundColor: region.color }}
                />
                {selectedLabel}
              </div>
            )}
            {region.tags && (
              <div className="tags">
                {region.tags.map((t) => (
                  <div key={t} className="tag">
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: 200 }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div
                style={{
                  display: "flex",
                  backgroundColor: region.color || "#888",
                  color: "#fff",
                  padding: 4,
                  paddingLeft: 8,
                  paddingRight: 8,
                  borderRadius: 4,
                  fontWeight: "bold",
                  textShadow: "0px 0px 5px rgba(0,0,0,0.4)",
                }}
              >
                {region.type}
              </div>
              <div style={{ flexGrow: 1 }} />
              <IconButton
                onClick={() => onDelete(region)}
                tabIndex={-1}
                style={{ width: 22, height: 22 }}
                size="small"
              >
                <TrashIcon style={{ marginTop: -8, width: 16, height: 16 }} />
              </IconButton>
            </div>
            {(allowedClasses || []).length > 0 && (
              <div style={{ marginTop: 6 }}>
                {isCreatableAllowedClasses ? (
                  <CreatableSelect
                    placeholder="Classification"
                    onChange={(o, actionMeta) => {
                      if (!o) return;
                      if (
                        actionMeta.action == "create-option" &&
                        onRegionClassAdded
                      ) {
                        onRegionClassAdded(o.value);
                      }
                      onChange({
                        ...region,
                        cls: o.value,
                      });
                    }}
                    value={selectedValue}
                    options={asMutable(
                      allowedClasses?.map((c) => {
                        if (typeof c === "string") {
                          return { value: c, label: c };
                        }
                        return { value: c.id, label: c.label };
                      })
                    )}
                  />
                ) : (
                  <Select
                    placeholder="Classification"
                    onChange={(o) => {
                      if (!o) return;
                      onChange({
                        ...region,
                        cls: o.value,
                      });
                    }}
                    value={selectedValue}
                    options={asMutable(
                      allowedClasses?.map((c) => {
                        if (typeof c === "string") {
                          return { value: c, label: c };
                        }
                        return { value: c.id, label: c.label };
                      })
                    )}
                  />
                )}
              </div>
            )}
            {(allowedTags || []).length > 0 && (
              <div style={{ marginTop: 4 }}>
                <Select
                  onChange={(newTags) =>
                    onChange({
                      ...region,
                      tags: newTags.map((t) => t.value),
                    })
                  }
                  placeholder="Tags"
                  value={(region.tags || []).map((c) => ({
                    label: c,
                    value: c,
                  }))}
                  isMulti
                  options={asMutable(
                    allowedTags?.map((c) => ({ value: c, label: c }))
                  )}
                />
              </div>
            )}
            {allowComments && (
              <TextField
                InputProps={{
                  className: classes.commentBox,
                }}
                fullWidth
                multiline
                rows={3}
                ref={commentInputRef}
                onClick={onCommentInputClick}
                value={region.comment || ""}
                onChange={(event) =>
                  onChange({ ...region, comment: event.target.value })
                }
              />
            )}
            {onClose && (
              <div style={{ marginTop: 4, display: "flex" }}>
                <div style={{ flexGrow: 1 }} />
                <Button
                  onClick={() => onClose(region)}
                  size="small"
                  variant="contained"
                  color="primary"
                >
                  <CheckIcon />
                </Button>
              </div>
            )}
          </div>
        )}
      </Paper>
    </ThemeProvider>
  );
};

export default memo(
  RegionLabel,
  (prevProps, nextProps) =>
    prevProps.editing === nextProps.editing &&
    prevProps.region === nextProps.region
);
