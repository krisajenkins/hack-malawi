(ns ddc.core
  (:use [c2.core]
        [clojure.pprint]
        [clojure.string :only [join]]
        )
  (:require [c2.scale :as scale]))

(def data [{:title "Revenue"       :subtitle "USD in thousands" :ranges [150 225 300]    :measures [220 270]   :markers [250]}
           {:title "Profit"        :subtitle "%"                :ranges [20 25 30]       :measures [21 23]     :markers [26]}
           {:title "Order Size"    :subtitle "USD average"      :ranges [350 500 600]    :measures [100 320]   :markers [550]}
           {:title "New Customers" :subtitle "count"            :ranges [1400 2000 2500] :measures [1000 1650] :markers [2100]}
           {:title "Satisfaction"  :subtitle "out of 5"         :ranges [3.5 4.25 5]     :measures [3.2 4.7]   :markers [4.4]}])

;(unify [:div#main]
;       data
;       (fn [{:keys [title]}]
;         [:div title]
;         ))

(def time-scale (scale/linear :domain [0 24]
                              :range [0 100]))

(defn to-css [m]
  (join (for [[k v] m]
          (str (name k) \: (name v) \;))))

(def shift-data (atom [{:title "Fran's shift" :start 8 :end 14}
                       {:title "Kris's shift" :start 10 :end 18}]))

[:div#main
 [:style {:type "text/css"} "#main {
                               width: 600px;
                             }

                             .shift {
                               border: solid 1px blue;
                               margin: 10px;
                               padding: 10px;
                             }
                             .time {
                               background-color: green;
                             }"] 

 [:div {:style (to-css {:width "500px"})}
  (unify (range 24)
         (fn [x]
           [:div {:style (to-css {:position :relative
                                  :left (str (float (time-scale x)) "%")
                                  :top "0px"})}
            (str x)]))]

 (unify
   @shift-data

   (fn [{:keys [title start end]}]
     [:div.shift
      [:div.title title]
      [:div.time {:style (to-css {
                                  :left  (str (float (time-scale start)) "%")
                                  :width (str (float (time-scale (- end start))) "%")
                                  :position :relative
                                  })}
       title]]))

 ]
