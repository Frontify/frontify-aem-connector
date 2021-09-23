package com.frontify.core.models;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.PostConstruct;
import lombok.Getter;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ChildResource;

@Model(adaptables = Resource.class, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class FrontifyImageMultifield {

  @ChildResource(name = "images")
  private List<Resource> imagesResourceList;

  @Getter
  private List<ImageMultiField> images = new ArrayList<>();

  @PostConstruct
  public void init() {
    if (imagesResourceList != null) {
      for (Resource resource : imagesResourceList) {
        ImageMultiField imageMultiField = new ImageMultiField();
        imageMultiField.setFileReference(resource.getValueMap().get("fileReference", String.class));
        imageMultiField.setFocalPoint(resource.getValueMap().get("focalPoint", String.class));
        imageMultiField.setTitle(resource.getValueMap().get("title", String.class));
        images.add(imageMultiField);
      }
    }

  }

}
