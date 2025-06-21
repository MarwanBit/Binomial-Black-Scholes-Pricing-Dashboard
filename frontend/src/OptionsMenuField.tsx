import { OptionsMenuFieldProps } from './types/types'

/**
 * OptionsMenuField Component
 *
 * @description
 * This component is the component responsible for handling and updating a particular field of the
 * formData state variable in the OptionsMenu.
 *
 * @param param0 props passed from the OptionsMenu containing the formData, field, handleChange function
 * and label (string).
 * @returns OptionsMenuField Component
 * @component
 * @example
 * <OptionsMenuField props={formData, "stock", handleChange, "Stock"}
 **/
function OptionsMenuField(props: OptionsMenuFieldProps) {
  return (
    <div className="flex flex-col justify-between hover:bg-blue-200">
      <label>{props.label}:</label>
      <input
        className="text-center"
        type="text"
        name={props.field}
        value={props.formData[props.field]}
        onChange={props.handleChange}
        required
      />
    </div>
  )
}

export default OptionsMenuField
